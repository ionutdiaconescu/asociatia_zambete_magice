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

  // If the deploy platform provides the pooler CA via POOLER_CA (PEM string),
  // write it to a temp file and set NODE_EXTRA_CA_CERTS so Node and spawned
  // processes trust the Supabase pooler root CA. This helps avoid
  // SELF_SIGNED_CERT_IN_CHAIN errors on platforms where the root is not trusted.
  try {
    const poolerCa = process.env.POOLER_CA;
    if (poolerCa) {
      const os = require("os");
      const path = require("path");
      const tmpDir = os.tmpdir();
      const pemPath = path.join(tmpDir, "pooler-root.pem");
      try {
        fs.writeFileSync(pemPath, poolerCa, { encoding: "utf8" });
        // Ensure child processes inherit this environment so they also use the
        // extra trusted CA when establishing TLS connections.
        process.env.NODE_EXTRA_CA_CERTS = pemPath;
        console.log(
          `[wrapper] Wrote POOLER_CA to ${pemPath} and set NODE_EXTRA_CA_CERTS`
        );
      } catch (e) {
        console.warn(
          "[wrapper] Failed to write POOLER_CA to disk:",
          e && e.message
        );
      }
    }
  } catch (e) {
    // ignore any issues here
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

  // Capture stdout/stderr so that if Strapi crashes quickly we still surface
  // its output in the wrapper logs (Render sometimes trims child output).
  const useShell = process.platform === "win32";
  const child = spawn(cmd, args, {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    // On Windows .cmd files must be run through the shell (cmd.exe).
    shell: useShell,
  });

  console.log(`[wrapper-sentinel] id=${sentinelId} spawned pid=${child.pid}`);

  // Accumulate stdout/stderr up to a reasonable cap so we can print a tail on exit.
  const CAP = 256 * 1024; // 256 KB per stream
  let stdoutBuf = Buffer.alloc(0);
  let stderrBuf = Buffer.alloc(0);

  if (child.stdout) {
    child.stdout.on("data", (chunk) => {
      try {
        process.stdout.write(chunk);
        stdoutBuf = Buffer.concat([stdoutBuf, Buffer.from(chunk)]);
        if (stdoutBuf.length > CAP) {
          stdoutBuf = stdoutBuf.slice(stdoutBuf.length - CAP);
        }
      } catch (e) {
        // ignore
      }
    });
  }

  if (child.stderr) {
    child.stderr.on("data", (chunk) => {
      try {
        process.stderr.write(chunk);
        stderrBuf = Buffer.concat([stderrBuf, Buffer.from(chunk)]);
        if (stderrBuf.length > CAP) {
          stderrBuf = stderrBuf.slice(stderrBuf.length - CAP);
        }
      } catch (e) {
        // ignore
      }
    });
  }

  child.on("exit", (code, signal) => {
    try {
      if (stdoutBuf && stdoutBuf.length) {
        const TAIL_LEN = 64 * 1024;
        const out = stdoutBuf.toString("utf8");
        const trimmed = out.length > TAIL_LEN ? out.slice(-TAIL_LEN) : out;
        console.log("[wrapper-child-stdout] START");
        console.log(trimmed);
        console.log("[wrapper-child-stdout] END");
      }
      if (stderrBuf && stderrBuf.length) {
        const TAIL_LEN = 64 * 1024;
        const out = stderrBuf.toString("utf8");
        const trimmed = out.length > TAIL_LEN ? out.slice(-TAIL_LEN) : out;
        console.log("[wrapper-child-stderr] START");
        console.log(trimmed);
        console.log("[wrapper-child-stderr] END");
      }
    } catch (e) {
      // ignore
    }

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
    try {
      if (stderrBuf && stderrBuf.length) {
        console.log("[wrapper-child-stderr] START");
        console.log(stderrBuf.toString("utf8"));
        console.log("[wrapper-child-stderr] END");
      }
    } catch (e) {
      // ignore
    }
    process.exit(1);
  });
})();
