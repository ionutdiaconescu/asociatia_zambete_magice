// Wrapper to ensure Strapi always finds a database config.
// Prefer env-specific config (config/env/<NODE_ENV>/database.js),
// fall back to a best-effort default built from env vars.
module.exports = ({ env }) => {
  const nodeEnv = process.env.NODE_ENV || "development";
  // try to load env-specific file
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const envCfgFactory = require(`./env/${nodeEnv}/database.js`);
    if (typeof envCfgFactory === "function") {
      const cfg = envCfgFactory({ env });
      if (cfg && cfg.connection) return cfg;
    }
  } catch (e) {
    // ignore - we'll fall back to environment-derived config
  }

  // Fallback: construct a minimal postgres config from env vars so
  // db.config.connection is never undefined.
  const connectionString = env("DATABASE_URL");
  const client = env("DATABASE_CLIENT", "postgres");
  const ssl = env.bool ? env.bool("DATABASE_SSL", true) : true;

  return {
    connection: {
      client,
      connection: connectionString
        ? { connectionString, ssl: ssl ? { rejectUnauthorized: false } : false }
        : {
            host: env("DATABASE_HOST", "127.0.0.1"),
            port: env("DATABASE_PORT", 5432),
            database: env("DATABASE_NAME", "postgres"),
            user: env("DATABASE_USERNAME", env("PGUSER", "postgres")),
            password: env("DATABASE_PASSWORD", env("PGPASSWORD", "")),
            ssl: ssl ? { rejectUnauthorized: false } : false,
          },
    },
  };
};
module.exports = ({ env }) => {
  const client = env("DATABASE_CLIENT", "postgres");
  const url = env("DATABASE_URL");
  const ssl = env.bool("DATABASE_SSL", true);
  try {
    // Helpful debug logs for Render deploys — will appear in build/runtime logs
    // Mask password when logging the URL
    const safeUrl = url ? url.replace(/:[^:@]+@/, ":***@") : url;
    console.log("[db-config] DATABASE_CLIENT=", client);
    console.log("[db-config] DATABASE_URL=", safeUrl);
    // Parse and log the username part from the URL so we can confirm which DB user is used
    try {
      const m = url && url.match(/^postgres(?:ql)?:\/\/([^:@]+)(?::|@)/i);
      const dbUser = m ? m[1] : undefined;
      console.log("[db-config] DB_USER=", dbUser || "(none)");
    } catch (e) {
      console.log("[db-config] DB_USER= (parse-error)");
    }
    console.log("[db-config] DATABASE_SSL=", ssl);
  } catch (e) {
    // swallow logging errors to avoid breaking startup
  }
  if (client !== "postgres") {
    throw new Error("Only Postgres is supported in this deployment!");
  }
  if (!url) {
    throw new Error("DATABASE_URL is not set!");
  }
  // Parse the DATABASE_URL and provide explicit connection fields to the pg client.
  // This avoids ambiguity where some environments or drivers may prefer separate fields.
  try {
    const parsed = new URL(url);
    const dbHost = parsed.hostname;
    const dbPort = parsed.port || 5432;
    const dbName = parsed.pathname
      ? parsed.pathname.replace(/^\//, "")
      : undefined;
    // Prefer explicit env overrides for username/password if present
    const parsedUser = parsed.username || undefined;
    const parsedPassword = parsed.password || undefined;
    const envUser = env("DATABASE_USERNAME", parsedUser);
    const envPassword = env("DATABASE_PASSWORD", parsedPassword);

    const connectionObj = {
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: envUser,
      password: envPassword,
      ssl: ssl ? { rejectUnauthorized: false } : false,
    };

    // Log a masked preview of the parsed connection object so we can confirm
    try {
      const maskedUser = connectionObj.user || "(none)";
      const maskedHost = connectionObj.host || "(none)";
      console.log(
        "[db-config] parsed connection -> user=",
        maskedUser,
        ", host=",
        maskedHost,
        ", db=",
        connectionObj.database
      );
      // If the parsed user differs from the env override, log that we overrode it
      if (parsedUser && envUser && parsedUser !== envUser) {
        try {
          console.log(
            "[db-config] INFO: DATABASE_USERNAME override in effect. parsedUser=",
            parsedUser,
            "-> using=",
            envUser
          );
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }

    // For reliability in this environment prefer passing the full connectionString
    // (DATABASE_URL) to the driver. This ensures the exact credentials in the URL
    // are used by the pg client. This is a safe, temporary measure for debugging.
    return {
      connection: {
        client: "postgres",
        connection: {
          connectionString: url,
          ssl: ssl ? { rejectUnauthorized: false } : false,
        },
      },
    };
  } catch (e) {
    // If parsing fails, fall back to connectionString
    return {
      connection: {
        client: "postgres",
        connection: {
          connectionString: url,
          ssl: ssl ? { rejectUnauthorized: false } : false,
        },
      },
    };
  }
};
