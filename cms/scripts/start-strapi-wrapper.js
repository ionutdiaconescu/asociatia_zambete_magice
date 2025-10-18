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
    if (!process.env.PGUSER)
      process.env.PGUSER = parsed.user || process.env.PGUSER;
    if (!process.env.PGPASSWORD)
      process.env.PGPASSWORD = parsed.password || process.env.PGPASSWORD;
    if (!process.env.DATABASE_USERNAME)
      process.env.DATABASE_USERNAME =
        parsed.user || process.env.DATABASE_USERNAME;
    if (!process.env.DATABASE_PASSWORD)
      process.env.DATABASE_PASSWORD =
        parsed.password || process.env.DATABASE_PASSWORD;
  }

  await runDiagnostics();

  // If caller set SKIP_STRAPI_START=true we don't spawn Strapi (useful for testing)
  if (process.env.SKIP_STRAPI_START === "true") {
    console.log(
      "[wrapper] SKIP_STRAPI_START enabled, exiting after diagnostics"
    );
    process.exit(0);
  }

  // Start Strapi in the same process via npx to ensure env vars persist.
  // Use spawn so we forward stdout/stderr.
  const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const args = ["strapi", "start"];

  console.log(
    "[wrapper] Starting Strapi with env: PGUSER=",
    process.env.PGUSER ? "set" : "unset"
  );

  const child = spawn(cmd, args, { stdio: "inherit", env: process.env });

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
