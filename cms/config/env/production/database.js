module.exports = ({ env }) => {
  const url = env("DATABASE_URL");
  const ssl = env.bool("DATABASE_SSL", true);

  return {
    connection: {
      client: "postgres",
      connection: {
        connectionString: url,
        ssl: ssl ? { rejectUnauthorized: false } : false,
      },
    },
  };
};
