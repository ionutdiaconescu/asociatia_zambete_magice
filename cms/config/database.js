module.exports = {
  connection: {
    client: "postgres",
    connection: process.env.DATABASE_URL,
  },
};
