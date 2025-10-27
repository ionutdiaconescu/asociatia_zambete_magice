// Prefer env-specific config (config/env/<NODE_ENV>/database.js),
// fall back to a best-effort default built from env vars.
// Defensive root DB config for Strapi.
// Prefer env-specific config (config/env/<NODE_ENV>/database.js).
// If that is missing or doesn't return a connection, always build
// a best-effort connection object from process.env so Strapi never
// receives an undefined `db.config.connection`.
module.exports = ({ env }) => {
  const nodeEnv = process.env.NODE_ENV || "development";

  // 1) Try env-specific file first. If it returns a usable cfg, use it.
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const envCfgFactory = require(`./env/${nodeEnv}/database.js`);
    if (typeof envCfgFactory === "function") {
      const cfg = envCfgFactory({ env });
      if (cfg && cfg.connection) return cfg;
    }
  } catch (e) {
    // ignore and fall back
  }

  // 2) Build from environment variables, preferring process.env values
  // (handles cases where a pre-start script wasn't executed).
  const connectionString =
    process.env.DATABASE_URL || (env && env("DATABASE_URL"));
  const client =
    process.env.DATABASE_CLIENT ||
    (env && env("DATABASE_CLIENT")) ||
    "postgres";
  const sslEnabledRaw =
    process.env.DATABASE_SSL ||
    (env && (env.bool ? env.bool("DATABASE_SSL", true) : undefined));
  const ssl =
    typeof sslEnabledRaw === "string"
      ? sslEnabledRaw !== "false"
      : !!sslEnabledRaw;

  // If we have a connection string, parse it to extract user/pass and
  // populate process.env early so any consumer that reads process.env
  // directly will see the correct PG credentials.
  if (connectionString) {
    try {
      const parsed = new URL(connectionString);
      const user =
        parsed.username || process.env.DATABASE_USERNAME || process.env.PGUSER;
      const password =
        parsed.password ||
        process.env.DATABASE_PASSWORD ||
        process.env.PGPASSWORD;
      const host = parsed.hostname;
      const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
      const database = parsed.pathname
        ? parsed.pathname.replace(/^\//, "")
        : process.env.DATABASE_NAME || "postgres";

      try {
        if (!process.env.PGUSER && user) process.env.PGUSER = user;
        if (!process.env.PGPASSWORD && password)
          // NODE_ENV is used to select which config to load (e.g., production, development). Platforms like Render or npm may set it automatically. If not set, defaults to 'development'.
          // This ensures Strapi loads the correct database config for the environment.
          process.env.PGPASSWORD = password;
        if (!process.env.DATABASE_USERNAME && user)
          process.env.DATABASE_USERNAME = user;
        if (!process.env.DATABASE_PASSWORD && password)
          process.env.DATABASE_PASSWORD = password;
      } catch (e) {
        // ignore
      }

      // Build ssl object; if POOLER_CA is provided in env (PEM string)
      // include it as `ca` so the pg client trusts the pooler root directly.
      let sslConfig = false;
      if (ssl) {
        sslConfig = { rejectUnauthorized: false };
        try {
          const poolerCa = process.env.POOLER_CA;
          if (poolerCa) {
            sslConfig.ca = poolerCa;
            // Note: when ca is provided inline, Node/pg will use it directly.
          }
        } catch (e) {
          // ignore and use rejectUnauthorized: false fallback
        }
      }

      return {
        connection: {
          client,
          connection: {
            host,
            port,
            database,
            user,
            password,
            ssl: sslConfig,
          },
        },
      };
    } catch (e) {
      // If parsing fails, still return the connectionString form.
      return {
        connection: {
          client,
          connection: {
            connectionString,
            ssl: ssl ? { rejectUnauthorized: false } : false,
          },
        },
      };
    }
  }

  // 3) No DATABASE_URL; build from PG env vars or defaults.
  const result = {
    connection: {
      client,
      connection: {
        host:
          process.env.DATABASE_HOST ||
          (env && env("DATABASE_HOST", "127.0.0.1")),
        port: process.env.DATABASE_PORT
          ? parseInt(process.env.DATABASE_PORT, 10)
          : env && env.int
            ? env.int("DATABASE_PORT", 5432)
            : 5432,
        database:
          process.env.DATABASE_NAME ||
          (env && env("DATABASE_NAME", "postgres")),
        user:
          process.env.DATABASE_USERNAME ||
          process.env.PGUSER ||
          (env && env("DATABASE_USERNAME", env("PGUSER", "postgres"))) ||
          "postgres",
        password:
          process.env.DATABASE_PASSWORD ||
          process.env.PGPASSWORD ||
          (env && env("DATABASE_PASSWORD", env("PGPASSWORD", ""))) ||
          "",
        ssl: ssl ? { rejectUnauthorized: false } : false,
      },
    },
  };

  // Guard: detect if effective user is default 'postgres' and fail fast with a masked message
  try {
    const effectiveUser = result.connection.connection.user;
    const mask = (v) => (v ? "***" : "");
    if (!effectiveUser || effectiveUser === "postgres") {
      const msg =
        `DB config guard: refusing to start with user=${effectiveUser || "<empty>"}.` +
        ` Ensure DATABASE_URL contains the pooler username or set PGUSER/PGPASSWORD in env.`;
      console.error(
        "[db-guard]",
        msg,
        "masked_password=",
        mask(result.connection.connection.password)
      );
      throw new Error(msg);
    }
  } catch (e) {
    throw e;
  }

  return result;
};
