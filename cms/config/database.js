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
