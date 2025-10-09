// JS mirror of server.ts for ts-node executed scripts
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: env("PUBLIC_URL", "https://asociatia-zambete-magice.onrender.com"),
  proxy: true,
  app: {
    keys: env.array("APP_KEYS"),
  },
});
