// server.ts – TypeScript version so Strapi loader treats it uniformly with other TS configs
export default ({ env }) => {
  const keys = env.array("APP_KEYS");
  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),
    app: { keys },
  };
};
