// JS mirror of database.ts so Strapi config loader (expects .js/.json) works for standalone ts-node scripts.
const path = require("path");
// Force IPv4 resolution first to avoid ENETUNREACH on environments without IPv6 routing
try {
  require("dns").setDefaultResultOrder &&
    require("dns").setDefaultResultOrder("ipv4first");
} catch (_) {}

module.exports = ({ env }) => {
  const client = (env("DATABASE_CLIENT", "sqlite") || "sqlite").toLowerCase();

  // Lightweight debug info to confirm which DB config is actually loaded at runtime.
  // Set DEBUG_DB_CONFIG=1 in env to print this (avoids noisy logs in production by default).
  const debug = env.bool
    ? env.bool("DEBUG_DB_CONFIG", false)
    : env("DEBUG_DB_CONFIG") === "true";

  if (client === "postgres") {
    const host = env("DATABASE_HOST", "127.0.0.1");
    const port = env.int
      ? env.int("DATABASE_PORT", 5432)
      : parseInt(env("DATABASE_PORT", "5432"), 10);
    const database = env("DATABASE_NAME", "strapi");
    const user = env("DATABASE_USERNAME", "strapi");
    const schema = env("DATABASE_SCHEMA", "public");
    if (debug) {
      console.log(
        `[database.js] Using Postgres -> host=${host} port=${port} db=${database} user=${user} schema=${schema} ssl=${env("DATABASE_SSL", "false")}`
      );
    }
    return {
      connection: {
        client: "postgres",
        connection: {
          host,
          port,
          database,
          user,
          password: env("DATABASE_PASSWORD", "strapi"),
          schema,
          ssl: env.bool("DATABASE_SSL", false)
            ? {
                rejectUnauthorized: env.bool(
                  "DATABASE_SSL_REJECT_UNAUTHORIZED",
                  true
                ),
              }
            : false,
        },
        pool: {
          min: env.int("DATABASE_POOL_MIN", 2),
          max: env.int("DATABASE_POOL_MAX", 10),
        },
      },
    };
  }

  // sqlite fallback
  return {
    connection: {
      client: "sqlite",
      connection: {
        filename: path.join(
          __dirname,
          "..",
          "..",
          env("DATABASE_FILENAME", ".tmp/data.db")
        ),
      },
      useNullAsDefault: true,
    },
  };
};
