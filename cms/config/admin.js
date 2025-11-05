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
  // Forțează servirea admin din build local
  serveAdminPanel: true,
  // Setează calea absolută către build
  buildPath: path.join(__dirname, "..", "dist"),
  // URL-ul admin panel-ului
  url: env("ADMIN_URL", "/admin"),
});
