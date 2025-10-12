module.exports = ({ env }) => ({
  connection: {
    client: env("DATABASE_CLIENT", "postgres"),
    connection: env("DATABASE_URL"),
    ssl: env.bool("DATABASE_SSL", true),
  },
});
