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
    const rawUrl = env("DATABASE_URL");
    let host, port, database, user, password, schema;
    if (rawUrl) {
      try {
        // Accept both postgres:// and postgresql://
        const normalized = rawUrl.replace(/^postgres:\/\//, "postgresql://");
        const u = new URL(normalized);
        user = decodeURIComponent(u.username);
        password = decodeURIComponent(u.password);
        host = u.hostname;
        port = parseInt(u.port || "5432", 10);
        // pathname like /dbname
        database = u.pathname
          ? u.pathname.replace(/^\//, "")
          : env("DATABASE_NAME", "strapi");
        // Optional schema via search param schema=public
        const sp = u.searchParams;
        schema = sp.get("schema") || env("DATABASE_SCHEMA", "public");
        if (debug) {
          console.log(
            `[database.js] Parsed DATABASE_URL host=${host} port=${port} db=${database} user=${user} schema=${schema}`
          );
        }
      } catch (e) {
        console.error(
          "[database.js] Failed to parse DATABASE_URL, falling back to discrete vars:",
          e.message
        );
      }
    }
    // Fallback to discrete variables if parsing missing
    host = host || env("DATABASE_HOST", "127.0.0.1");
    port =
      port ||
      (env.int
        ? env.int("DATABASE_PORT", 5432)
        : parseInt(env("DATABASE_PORT", "5432"), 10));
    database = database || env("DATABASE_NAME", "strapi");
    user = user || env("DATABASE_USERNAME", "strapi");
    password = password || env("DATABASE_PASSWORD", "strapi");
    schema = schema || env("DATABASE_SCHEMA", "public");

    const sslEnabled = env.bool("DATABASE_SSL", true); // default true for hosted providers
    const rejectUnauthorized = env.bool(
      "DATABASE_SSL_REJECT_UNAUTHORIZED",
      false
    );
    if (debug) {
      console.log(
        `[database.js] Using Postgres -> host=${host} port=${port} db=${database} user=${user} schema=${schema} ssl=${sslEnabled} rejectUnauthorized=${rejectUnauthorized}`
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
          password,
          schema,
          ssl: sslEnabled
            ? {
                rejectUnauthorized,
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
