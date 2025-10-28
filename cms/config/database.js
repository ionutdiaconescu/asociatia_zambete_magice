// Prefer env-specific config (config/env/<NODE_ENV>/database.js),
// fall back to a best-effort default built from env vars.
// Defensive root DB config pentru Strapi.
require("dotenv").config();
console.log(
  "[strapi-db-config] Loaded config/database.js at",
  new Date().toISOString()
);
console.log("[env-vars]", process.env.DATABASE_URL, process.env.POOLER_CA_B64);
const fs = require("fs");
const logPath = "/tmp/strapi-db-config.log";
try {
  fs.appendFileSync(
    logPath,
    `\n[${new Date().toISOString()}] Loaded config/database.js\n` +
      `DATABASE_URL=${process.env.DATABASE_URL}\n` +
      `POOLER_CA_B64=${process.env.POOLER_CA_B64}\n` +
  // ...existing code...
  );
} catch (e) {}
module.exports = () => {
  // Fallback direct pe process.env, fără funcția env
  const config = {
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
  };

  // Log pentru debugging: vezi structura configului returnat
  try {
    console.log("[debug-db-config]", JSON.stringify(config, null, 2));
    // Mask sensitive fields for file dump
    function maskConfig(cfg) {
      const clone = JSON.parse(JSON.stringify(cfg));
      if (clone.connection) {
        if (clone.connection.password) {
          clone.connection.password = "****";
        }
        if (clone.connection.ssl && clone.connection.ssl.ca) {
          clone.connection.ssl.ca = "[MASKED]";
        }
      }
      return clone;
    }
    const masked = maskConfig(config);
    const fs = require("fs");
    fs.writeFileSync(
      "/tmp/strapi-db-config.json",
      JSON.stringify(masked, null, 2)
    );
    // Log contents of /tmp/strapi-db-config.json for Render visibility
    try {
      const fileContents = fs.readFileSync(
        "/tmp/strapi-db-config.json",
        "utf8"
      );
      console.log(
        "[debug-db-config-file] /tmp/strapi-db-config.json:",
        fileContents
      );
    } catch (e) {
      console.log(
        "[debug-db-config-file] Could not read /tmp/strapi-db-config.json:",
        e.message
      );
    }
  } catch (e) {}

  return config;
};
