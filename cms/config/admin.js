// JS mirror of admin.ts for ts-node executed scripts
const path = require("path");

module.exports = ({ env }) => ({
  auth: { secret: env("ADMIN_JWT_SECRET") },
  apiToken: { salt: env("API_TOKEN_SALT") },
  transfer: { token: { salt: env("TRANSFER_TOKEN_SALT") } },
  secrets: { encryptionKey: env("ENCRYPTION_KEY") },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
  // Folosește process.cwd() pentru calea absolută corectă pe Render
  serveAdminPanel: true,
  buildPath: path.join(process.cwd(), "dist", "build"),
  url: env("ADMIN_URL", "/admin"),
});
