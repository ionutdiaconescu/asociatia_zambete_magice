module.exports = ({ env }) => {
  console.log("DATABASE_URL:", env("DATABASE_URL"));
  console.log("DATABASE_CLIENT:", env("DATABASE_CLIENT"));
  console.log("DATABASE_SSL:", env("DATABASE_SSL"));
  return {
    connection: {
      client: env("DATABASE_CLIENT", "postgres"),
      connection: env("DATABASE_URL"),
      ssl: env.bool("DATABASE_SSL", true),
    },
  };
};
