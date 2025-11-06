// JS mirror of admin.ts for ts-node executed scripts
module.exports = ({ env }) => ({
  auth: { secret: env("ADMIN_JWT_SECRET") },
  apiToken: { salt: env("API_TOKEN_SALT") },
  transfer: { token: { salt: env("TRANSFER_TOKEN_SALT") } },
  secrets: { encryptionKey: env("ENCRYPTION_KEY") },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
  // Configurația experimentală pentru Strapi v5 admin API
  url: "/admin",
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  serveAdminPanel: true,
  autoOpen: false,
  rateLimit: {
    enabled: false,
  },
  forgotPassword: {
    emailTemplate: {
      subject: "Reset password",
      text: "Someone requested to reset your password",
    },
  },
});
