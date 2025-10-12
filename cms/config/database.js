console.log("=== database.js loaded ===");

const path = require("path");

const env = (key, def) => process.env[key] || def;
const debug = env("DEBUG_DB_CONFIG", "false") === "true";
const client = (env("DATABASE_CLIENT", "sqlite") || "sqlite").toLowerCase();

let config;

if (client === "postgres") {
  const rawUrl = env("DATABASE_URL");
  let host, port, database, user, password, schema;
  if (rawUrl) {
    try {
      const normalized = rawUrl.replace(/^postgres:\/\//, "postgresql://");
      const u = new URL(normalized);
      user = decodeURIComponent(u.username);
      password = decodeURIComponent(u.password);
      host = u.hostname;
      port = parseInt(u.port || "5432", 10);
      database = u.pathname
        ? u.pathname.replace(/^\//, "")
        : env("DATABASE_NAME", "strapi");
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
  host = host || env("DATABASE_HOST", "127.0.0.1");
  port = port || parseInt(env("DATABASE_PORT", "5432"), 10);
  database = database || env("DATABASE_NAME", "strapi");
  user = user || env("DATABASE_USERNAME", "strapi");
  password = password || env("DATABASE_PASSWORD", "strapi");
  schema = schema || env("DATABASE_SCHEMA", "public");

  const sslEnabled = env("DATABASE_SSL", "true") === "true";
  const rejectUnauthorized =
    env("DATABASE_SSL_REJECT_UNAUTHORIZED", "false") === "true";

  if (debug) {
    console.log(
      `[database.js] Using Postgres -> host=${host} port=${port} db=${database} user=${user} schema=${schema} ssl=${sslEnabled} rejectUnauthorized=${rejectUnauthorized}`
    );
    console.log(
      "[database.js] Full connection object (sanitized password length):",
      {
        host,
        port,
        database,
        user,
        passwordLength: password ? password.length : 0,
        schema,
        sslEnabled,
        rejectUnauthorized,
      }
    );
  }

  config = {
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
      min: parseInt(env("DATABASE_POOL_MIN", "2"), 10),
      max: parseInt(env("DATABASE_POOL_MAX", "10"), 10),
    },
    debug: debug,
  };
} else {
  config = {
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
  };
}

module.exports = config;
