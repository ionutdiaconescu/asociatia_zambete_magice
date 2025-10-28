// Prefer env-specific config (config/env/<NODE_ENV>/database.js),
// fall back to a best-effort default built from env vars.
// Defensive root DB config for Strapi.
// Prefer env-specific config (config/env/<NODE_ENV>/database.js).
// If that is missing or doesn't return a connection, always build
// a best-effort connection object from process.env so Strapi never
// receives an undefined `db.config.connection`.

module.exports = ({ env }) => {
  // Config simplu, direct din variabilele de mediu
  const client = process.env.DATABASE_CLIENT || "postgres";
  const connectionString = process.env.DATABASE_URL;
  const sslEnabled = process.env.DATABASE_SSL !== "false";
  const poolerCa = process.env.POOLER_CA_B64;

  let config;
  // Dacă există DATABASE_URL, folosește-l direct
  if (connectionString) {
    config = {
      connection: {
        client,
        connection: {
          connectionString,
          ssl: sslEnabled
            ? poolerCa
              ? { rejectUnauthorized: false, ca: poolerCa }
              : { rejectUnauthorized: false }
            : false,
        },
      },
    };
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
  try {
    console.log("[debug-db-config]", JSON.stringify(config, null, 2));
  } catch (e) {}

  return config;
};
