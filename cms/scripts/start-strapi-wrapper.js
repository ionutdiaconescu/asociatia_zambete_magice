#!/usr/bin/env node
"use strict";
// start-strapi-wrapper.js (refined)
// Purpose: deterministic startup for Strapi on deploy platforms.
// - Force PG envs from DATABASE_URL so platform overrides don't leak in
// - Support POOLER_CA or POOLER_CA_B64 to write a PEM and set NODE_EXTRA_CA_CERTS
// - Optionally require DB connectivity (`REQUIRE_DB_OK=true`) which will run
//   `scripts/test-db-connection.js` as a child process and fail the start if it fails.

const { spawnSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function maskUrl(u) {
  if (!u) return "";
  try {
    const parsed = new URL(u);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch (e) {
    return u.replace(/(:)([^:@]+)@/, ":***@");
  }
}

function parseDatabaseUrl(url) {
  if (!url) return null;
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

function writePoolerCaIfPresent() {
  try {
    let poolerCa = process.env.POOLER_CA;
    const poolerCaB64 = process.env.POOLER_CA_B64;
    if (!poolerCa && poolerCaB64) {
      try {
        poolerCa = Buffer.from(poolerCaB64, "base64").toString("utf8");
        process.env.POOLER_CA = poolerCa;
        console.log("[wrapper] Decoded POOLER_CA from POOLER_CA_B64");
      } catch (err) {
        console.warn(
          "[wrapper] POOLER_CA_B64 decode failed:",
          err && err.message
        );
      }
    }

    if (!poolerCa) return null;

    const os = require("os");
    const pemPath = path.join(os.tmpdir(), "pooler-root.pem");
    fs.writeFileSync(pemPath, poolerCa, { encoding: "utf8" });
    process.env.NODE_EXTRA_CA_CERTS = pemPath;
    const firstLine = poolerCa.split(/\r?\n/)[0] || "<no-header>";
    console.log(
      `[wrapper] Wrote POOLER_CA to ${pemPath}; PEM-header=${firstLine}`
    );
    return pemPath;
  } catch (e) {
    console.warn("[wrapper] Failed to write POOLER_CA:", e && e.message);
    return null;
  }
}

function runLocalDiagnostics(parsed) {
  try {
    console.log(`[wrapper] NODE_VERSION=${process.version}`);
    console.log(
      `[wrapper] RAW_DATABASE_URL=${maskUrl(process.env.DATABASE_URL)}`
    );
    if (parsed) console.log(`[wrapper] parsed DB url user=${parsed.user}`);
    // Best-effort: run lightweight checks (they won't fail the start)
    try {
      require("./check-env");
    } catch (e) {}
    try {
      require("./print-db-config");
    } catch (e) {}
  } catch (e) {
    // swallow diagnostics errors
  }
}

function runTestDbAndRequireSuccess() {
  // Run test-db-connection.js as a child process synchronously so we can decide
  // to abort startup if DB test fails. Use spawnSync for deterministic exit code.
  const testScript = path.join(__dirname, "test-db-connection.js");
  if (!fs.existsSync(testScript)) {
    console.warn(
      "[wrapper] REQUIRE_DB_OK is set but test script not found:",
      testScript
    );
    return false;
  }
  console.log(
    "[wrapper] REQUIRE_DB_OK=true -> running test-db-connection.js (synchronous)"
  );
  const nodeCmd = process.platform === "win32" ? "node.exe" : "node";
  const res = spawnSync(nodeCmd, [testScript], {
    stdio: "inherit",
    env: process.env,
    timeout: 120000,
  });
  if (res.error) {
    console.error(
      "[wrapper] test-db-connection failed to execute:",
      res.error && res.error.message
    );
    return false;
  }
  return res.status === 0;
}

(function main() {
  // 1) Ensure DATABASE_URL exists
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error(
      "[wrapper] ERROR: DATABASE_URL is not set. Set it and redeploy."
    );
    process.exit(2);
  }

  // 2) Parse and force PG envs from DATABASE_URL (deterministic behavior)
  const parsed = parseDatabaseUrl(dbUrl);
  if (!parsed) {
    console.error(
      "[wrapper] ERROR: Failed to parse DATABASE_URL. Check its format."
    );
    process.exit(2);
  }
  process.env.PGUSER = parsed.user || "";
  process.env.PGPASSWORD = parsed.password || "";
  process.env.DATABASE_USERNAME = parsed.user || "";
  process.env.DATABASE_PASSWORD = parsed.password || "";

  // 3) Defensive check: disallow raw 'postgres' user in production unless explicitly allowed
  if (
    process.env.NODE_ENV === "production" &&
    parsed.user === "postgres" &&
    process.env.ALLOW_RAW_POSTGRES !== "true"
  ) {
    console.error(
      '[wrapper] ERROR: DATABASE_URL resolves to user "postgres" in production. Rotate the password and use the dedicated pooler user. To bypass this check set ALLOW_RAW_POSTGRES=true (not recommended).'
    );
    process.exit(2);
  }

  // 4) Write POOLER_CA if provided and set NODE_EXTRA_CA_CERTS
  writePoolerCaIfPresent();

  // 5) Run lightweight diagnostics (non-fatal)
  runLocalDiagnostics(parsed);

  // 6) If REQUIRE_DB_OK=true, run DB test synchronously and fail if it fails
  if (process.env.REQUIRE_DB_OK === "true") {
    const ok = runTestDbAndRequireSuccess();
    if (!ok) {
      console.error(
        "[wrapper] Aborting start because DB connectivity test failed and REQUIRE_DB_OK=true"
      );
      process.exit(3);
    }
    console.log("[wrapper] DB connectivity test passed.");
  }

  // 7) Honor SKIP_STRAPI_START for testing convenience
  if (process.env.SKIP_STRAPI_START === "true") {
    console.log(
      "[wrapper] SKIP_STRAPI_START=true -> exiting after diagnostics"
    );
    process.exit(0);
  }

  // 8) Start Strapi (prefer local binary)
  const localBin = path.resolve(
    __dirname,
    "..",
    "node_modules",
    ".bin",
    process.platform === "win32" ? "strapi.cmd" : "strapi"
  );
  let cmd, args;
  if (fs.existsSync(localBin)) {
    cmd = localBin;
    args = ["start"];
    console.log("[wrapper] Using local strapi binary:", localBin);
  } else {
    cmd = process.platform === "win32" ? "npx.cmd" : "npx";
    args = ["--no-install", "strapi", "start"];
    console.log(
      "[wrapper] Local strapi not found, falling back to npx --no-install"
    );
  }

  const sentinelId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 0xffffff).toString(36)}`;
  process.env.WRAPPER_SENTINEL_ID = sentinelId;
  console.log(
    `[wrapper-sentinel] id=${sentinelId} spawning=${cmd} ${args.join(" ")}`
  );

  const useShell = process.platform === "win32";
  const child = spawn(cmd, args, {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    shell: useShell,
  });

  console.log(`[wrapper] spawned pid=${child.pid}`);

  // Stream child output and keep small tail buffers to show on exit
  const CAP = 256 * 1024;
  let stdoutBuf = Buffer.alloc(0),
    stderrBuf = Buffer.alloc(0);
  if (child.stdout)
    child.stdout.on("data", (c) => {
      process.stdout.write(c);
      stdoutBuf = Buffer.concat([stdoutBuf, Buffer.from(c)]);
      if (stdoutBuf.length > CAP)
        stdoutBuf = stdoutBuf.slice(stdoutBuf.length - CAP);
    });
  if (child.stderr)
    child.stderr.on("data", (c) => {
      process.stderr.write(c);
      stderrBuf = Buffer.concat([stderrBuf, Buffer.from(c)]);
      if (stderrBuf.length > CAP)
        stderrBuf = stderrBuf.slice(stderrBuf.length - CAP);
    });

  child.on("exit", (code, signal) => {
    try {
      if (stdoutBuf.length) {
        console.log("[wrapper-child-stdout] START");
        console.log(stdoutBuf.toString("utf8").slice(-64 * 1024));
        console.log("[wrapper-child-stdout] END");
      }
      if (stderrBuf.length) {
        console.log("[wrapper-child-stderr] START");
        console.log(stderrBuf.toString("utf8").slice(-64 * 1024));
        console.log("[wrapper-child-stderr] END");
      }
    } catch (e) {}
    if (signal) {
      console.log(`[wrapper] Strapi killed by signal ${signal}`);
      process.exit(1);
    } else {
      process.exit(code);
    }
  });

  child.on("error", (err) => {
    console.error(
      "[wrapper] Failed to spawn Strapi:",
      err && err.stack ? err.stack : err
    );
    try {
      if (stderrBuf.length) {
        console.log("[wrapper-child-stderr] START");
        console.log(stderrBuf.toString("utf8"));
        console.log("[wrapper-child-stderr] END");
      }
    } catch (e) {}
    process.exit(1);
  });
})();
