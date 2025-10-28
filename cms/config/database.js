// Prefer env-specific config (config/env/<NODE_ENV>/database.js),
// fall back to a best-effort default built from env vars.
// Defensive root DB config pentru Strapi.
require("dotenv").config();
module.exports = {
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
