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
  // Forțează servirea din build-ul local generat
  serveAdminPanel: true,
  buildPath: path.resolve(__dirname, "..", "dist", "build"),
  url: env("ADMIN_URL", "/admin"),
});
