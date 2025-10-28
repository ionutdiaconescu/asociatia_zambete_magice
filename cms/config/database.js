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
      `DATABASE_CLIENT=${process.env.DATABASE_CLIENT}\n`
  );
} catch (e) {}
module.exports = ({ env }) => {
  // Config simplu, direct din variabilele de mediu
  const client = process.env.DATABASE_CLIENT || "postgres";
  const connectionString = process.env.DATABASE_URL;
  const sslEnabled = process.env.DATABASE_SSL !== "false";
  const poolerCa = process.env.POOLER_CA_B64;

  let config;
  // Dacă există DATABASE_URL, folosește-l direct conform Strapi v4/v5
  if (connectionString) {
    // Dacă ai nevoie de SSL custom, folosește obiectul cu string + ssl
    if (sslEnabled && poolerCa) {
      config = {
        connection: {
          client,
          connection: {
            connectionString,
            ssl: { rejectUnauthorized: false, ca: poolerCa },
          },
        },
      };
    } else if (sslEnabled) {
      config = {
        connection: {
          client,
          connection: {
            connectionString,
            ssl: { rejectUnauthorized: false },
          },
        },
      };
    } else {
      // Cel mai simplu: doar stringul
      config = {
        connection: {
          client,
          connection: connectionString,
        },
      };
    }
  } else {
    // Dacă nu există DATABASE_URL, folosește variabilele individuale
    config = {
      connection: {
        client,
        connection: {
          host: process.env.DATABASE_HOST || "127.0.0.1",
          port: process.env.DATABASE_PORT
            ? parseInt(process.env.DATABASE_PORT, 10)
            : 5432,
          database: process.env.DATABASE_NAME || "postgres",
          user: process.env.DATABASE_USERNAME || "postgres",
          password: process.env.DATABASE_PASSWORD || "",
          ssl: sslEnabled
            ? poolerCa
              ? { rejectUnauthorized: false, ca: poolerCa }
              : { rejectUnauthorized: false }
            : false,
        },
      },
    };
  }

  // Log pentru debugging: vezi structura configului returnat

  // Log pentru debugging: vezi structura configului returnat
  try {
    console.log("[debug-db-config]", JSON.stringify(config, null, 2));
    // Mask sensitive fields for file dump
    function maskConfig(cfg) {
      const clone = JSON.parse(JSON.stringify(cfg));
      if (clone.connection && clone.connection.connection) {
        if (clone.connection.connection.connectionString) {
          clone.connection.connection.connectionString =
            clone.connection.connection.connectionString.replace(
              /:[^:@]+@/,
              ":****@"
            );
        }
        if (clone.connection.connection.password) {
          clone.connection.connection.password = "****";
        }
        if (
          clone.connection.connection.ssl &&
          clone.connection.connection.ssl.ca
        ) {
          clone.connection.connection.ssl.ca = "[MASKED]";
        }
      }
      return clone;
    }
    const masked = maskConfig(config);
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
