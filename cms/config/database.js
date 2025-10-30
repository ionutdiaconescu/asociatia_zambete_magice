// Prefer env-specific config (config/env/<NODE_ENV>/database.js),
// fall back to a best-effort default built from env vars.
// Defensive root DB config pentru Strapi.

module.exports = ({ env }) => {
  const config = {
    connection: {
      client: "postgres",
      connection: {
        host: env("DATABASE_HOST", "aws-1-eu-north-1.pooler.supabase.com"),
        port: env.int("DATABASE_PORT", 5432),
        database: env("DATABASE_NAME", "postgres"),
        user: env("DATABASE_USERNAME", "postgres.ajmvymmpwmtivuzgxwdh"),
        password: env("DATABASE_PASSWORD", ""),
      },
    },
  };

  // Deep runtime logging for debugging
  console.log(
    "[strapi-db-config] Loaded config/database.js at",
    new Date().toISOString()
  );
  console.log("[env-vars]", {
    DATABASE_HOST: env("DATABASE_HOST"),
    DATABASE_PORT: env("DATABASE_PORT"),
    DATABASE_NAME: env("DATABASE_NAME"),
    DATABASE_USERNAME: env("DATABASE_USERNAME"),
    DATABASE_PASSWORD: env("DATABASE_PASSWORD"),
  });
  console.log(
    "[strapi-db-config] Exported config:",
    JSON.stringify(config, null, 2)
  );

  // Write config to file for post-mortem analysis
  try {
    const fs = require("fs");
    // Mask sensitive fields
    const masked = JSON.parse(JSON.stringify(config));
    if (masked.connection && masked.connection.connection) {
      if (masked.connection.connection.password)
        masked.connection.connection.password = "****";
    }
    fs.writeFileSync(
      "/tmp/strapi-db-config.json",
      JSON.stringify(masked, null, 2)
    );
    fs.writeFileSync(
      "./strapi-db-config.json",
      JSON.stringify(masked, null, 2)
    );
    console.log(
      "[strapi-db-config] Dumped config to /tmp/strapi-db-config.json and ./strapi-db-config.json"
    );
  } catch (e) {
    console.log("[strapi-db-config] Could not write config file:", e.message);
  }

  return config;
};
