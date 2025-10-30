module.exports = () => ({
  connection: {
    client: "postgres",
    connection: {
      connectionString: process.env.DATABASE_URL,
    },
  },
});
