#!/usr/bin/env node
// start-strapi-wrapper.js
// Purpose: ensure process.env has correct PG credentials by parsing DATABASE_URL
// and then start Strapi in the same process so env changes persist.

const { spawn } = require("child_process");
const fs = require("fs");

function mask(s) {
  if (!s) return "";
  try {
    const u = new URL(s);
    if (u.password) {
      return s.replace(u.password, "***");
    }
  } catch (e) {}
  return s.replace(/(:)([^:@]+)@/, ":***@");
}

function parseDatabaseUrl(url) {
  try {
    const u = new URL(url);
    return {
      user: u.username,
      password: u.password,
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : 5432,
      database: u.pathname ? u.pathname.replace(/^\//, "") : "postgres",
    };
  } catch (e) {
    return null;
  }
}

async function runDiagnostics() {
  try {
    console.log(`[wrapper] NODE_VERSION= ${process.version}`);
    console.log(
      `[wrapper] RAW_DATABASE_URL= ${mask(process.env.DATABASE_URL)}`
    );
    const parsed = parseDatabaseUrl(process.env.DATABASE_URL || "");
    if (parsed) {
      console.log("[wrapper] parsed DB url user=", parsed.user);
    }

    // Attempt to run existing diagnostic scripts (non-blocking failures allowed)
    try {
      require("./ensure-pg-env");
    } catch (e) {
      // ignore
    }
    try {
      require("./check-env");
    } catch (e) {}
    try {
      require("./print-db-config");
    } catch (e) {}
    try {
      require("./test-db-connection");
    } catch (e) {}
  } catch (e) {
    // swallow
  }
}

(async function main() {
  // Parse DATABASE_URL and set PG envs if missing
  const dbUrl = process.env.DATABASE_URL || "";
  const parsed = parseDatabaseUrl(dbUrl);
  if (parsed) {
    // Force-override process envs from DATABASE_URL so nothing previously set
    // (even by platform-level envs) can accidentally point to the wrong user.
    // This makes the running process deterministic and matches the printed config.
    process.env.PGUSER = parsed.user || "";
    process.env.PGPASSWORD = parsed.password || "";
    process.env.DATABASE_USERNAME = parsed.user || "";
    process.env.DATABASE_PASSWORD = parsed.password || "";

    // Also mirror into DATABASE_URL if it's missing query ssl params to be safe
    // (we don't rewrite if user intentionally included params).
    if (process.env.DATABASE_URL && !/\?/g.test(process.env.DATABASE_URL)) {
      // keep existing DATABASE_URL untouched if it already contains ?
    }
  }

  await runDiagnostics();

  // If caller set SKIP_STRAPI_START=true we don't spawn Strapi (useful for testing)
  if (process.env.SKIP_STRAPI_START === "true") {
    console.log(
      "[wrapper] SKIP_STRAPI_START enabled, exiting after diagnostics"
    );
    process.exit(0);
  }

  // Start Strapi in the same process. Prefer the local binary so we avoid
  // npx downloading packages automatically; fallback to `npx --no-install`.
  const path = require("path");

  const localBin = path.resolve(
    __dirname,
    "..",
    "node_modules",
    ".bin",
    process.platform === "win32" ? "strapi.cmd" : "strapi"
  );
  let cmd;
  let args;

  if (fs.existsSync(localBin)) {
    cmd = localBin;
    args = ["start"];
    console.log("[wrapper] Using local strapi binary:", localBin);
  } else {
    cmd = process.platform === "win32" ? "npx.cmd" : "npx";
    args = ["--no-install", "strapi", "start"];
    console.log(
      "[wrapper] Local strapi binary not found, falling back to npx --no-install"
    );
  }

  console.log(
    "[wrapper] Starting Strapi with env: PGUSER=",
    process.env.PGUSER ? "set" : "unset"
  );
  // Create a short sentinel id so each wrapper invocation can be correlated in logs.
  const sentinelId = `${Date.now().toString(36)}-${Math.floor(
    Math.random() * 0xffffff
  ).toString(36)}`;
  process.env.WRAPPER_SENTINEL_ID = sentinelId;
  console.log(
    `[wrapper-sentinel] id=${sentinelId} spawning=${cmd} ${args.join(" ")}`
  );

  const child = spawn(cmd, args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });

  child.on("spawn", () => {
    console.log(`[wrapper-sentinel] id=${sentinelId} spawned pid=${child.pid}`);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`[wrapper] Strapi killed by signal ${signal}`);
      process.exit(1);
    } else {
      process.exit(code);
    }
  });

  child.on("error", (err) => {
    console.error(
      "[wrapper] Failed to start Strapi:",
      err && err.stack ? err.stack : err
    );
    process.exit(1);
  });
})();
