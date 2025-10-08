// JS mirror of database.ts so Strapi config loader (expects .js/.json) works for standalone ts-node scripts.
const path = require("path");
// Force IPv4 resolution first to avoid ENETUNREACH on environments without IPv6 routing
try {
  require("dns").setDefaultResultOrder &&
    require("dns").setDefaultResultOrder("ipv4first");
} catch (_) {}

module.exports = ({ env }) => {
  const client = (env("DATABASE_CLIENT", "sqlite") || "sqlite").toLowerCase();

  if (client === "postgres") {
    const host = env("DATABASE_HOST", "127.0.0.1");
    return {
      connection: {
        client: "postgres",
        connection: {
          host,
          port: env.int("DATABASE_PORT", 5432),
          database: env("DATABASE_NAME", "strapi"),
          user: env("DATABASE_USERNAME", "strapi"),
          password: env("DATABASE_PASSWORD", "strapi"),
          schema: env("DATABASE_SCHEMA", "public"),
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
