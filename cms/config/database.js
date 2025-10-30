module.exports = () => ({
  client: "postgres",
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    max: process.env.DATABASE_POOL_MAX
      ? parseInt(process.env.DATABASE_POOL_MAX)
      : 3,
    connectionTimeoutMillis: process.env.DATABASE_CONNECTION_TIMEOUT
      ? parseInt(process.env.DATABASE_CONNECTION_TIMEOUT)
      : 30000,
  },
});
