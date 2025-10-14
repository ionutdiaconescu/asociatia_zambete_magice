console.log(
  "ENV DEBUG:",
  process.env.DATABASE_CLIENT,
  process.env.DATABASE_URL,
  process.env.DATABASE_SSL
);
module.exports = ({ env }) => {
  const client = env("DATABASE_CLIENT", "postgres");
  const url = env("DATABASE_URL");
  const ssl = env.bool("DATABASE_SSL", true);
  if (client !== "postgres") {
    throw new Error("Only Postgres is supported in this deployment!");
  }
  if (!url) {
    throw new Error("DATABASE_URL is not set!");
  }
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
