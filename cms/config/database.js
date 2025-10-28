// Prefer env-specific config (config/env/<NODE_ENV>/database.js),
// fall back to a best-effort default built from env vars.
// Defensive root DB config pentru Strapi.

require("dotenv").config();

const config = {
  connection: {
    client: "postgres",
    connection: {
      host: process.env.DATABASE_HOST || "localhost",
      port: process.env.DATABASE_PORT
        ? parseInt(process.env.DATABASE_PORT, 10)
        : 5432,
      database: process.env.DATABASE_NAME || "strapi",
      user: process.env.DATABASE_USERNAME || "strapi",
      password: process.env.DATABASE_PASSWORD || "",
      ssl: process.env.POOLER_CA_B64
        ? { rejectUnauthorized: false, ca: process.env.POOLER_CA_B64 }
        : { rejectUnauthorized: false },
    },
  },
};

// Deep runtime logging for debugging

console.log(
  "[strapi-db-config] Loaded config/database.js at",
  new Date().toISOString()
);
console.log("[env-vars]", {
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  POOLER_CA_B64: process.env.POOLER_CA_B64,
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
    if (masked.connection.connection.ssl && masked.connection.connection.ssl.ca)
      masked.connection.connection.ssl.ca = "[MASKED]";
  }
  fs.writeFileSync(
    "/tmp/strapi-db-config.json",
    JSON.stringify(masked, null, 2)
  );
  fs.writeFileSync("./strapi-db-config.json", JSON.stringify(masked, null, 2));
  console.log(
    "[strapi-db-config] Dumped config to /tmp/strapi-db-config.json and ./strapi-db-config.json"
  );
} catch (e) {
  console.log("[strapi-db-config] Could not write config file:", e.message);
}

module.exports = config;
