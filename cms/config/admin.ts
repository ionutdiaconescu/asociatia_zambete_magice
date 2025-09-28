// Admin config in TS so Strapi loader (care deja ia database.ts) să preia și secretul JWT
// Marker pentru debug
export default ({ env }) => {
  const secret = env("ADMIN_JWT_SECRET");
  return {
    auth: {
      secret,
    },
    apiToken: {
      salt: env("API_TOKEN_SALT"),
    },
    transfer: {
      token: { salt: env("TRANSFER_TOKEN_SALT") },
    },
    secrets: {
      encryptionKey: env("ENCRYPTION_KEY"),
    },
    flags: {
      nps: env.bool("FLAG_NPS", true),
      promoteEE: env.bool("FLAG_PROMOTE_EE", true),
    },
  };
};
