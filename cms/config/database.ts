// Minimal TypeScript database config (attempt to force Strapi to load TS version)
// If this loads you'll see the console.log marker.

import path from "path";
// Force IPv4 first to avoid ENETUNREACH errors when the platform cannot reach IPv6 addresses
// (Render free services sometimes fail on IPv6-only first DNS result for Supabase hostnames)
try {
  // Node 18+ provides dns.setDefaultResultOrder
  // We guard with optional chaining to avoid crashes on older runtimes.
  // @ts-ignore - suppress if TS doesn't know about the method
  require("dns").setDefaultResultOrder?.("ipv4first");
} catch {}

export default ({ env }) => {
  const client = env("DATABASE_CLIENT", "sqlite").toLowerCase();
  // (debug log removed)

  if (client === "postgres") {
    return {
      connection: {
        client: "postgres",
        connection: {
          host: env("DATABASE_HOST", "127.0.0.1"),
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

  // Default sqlite fallback
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
