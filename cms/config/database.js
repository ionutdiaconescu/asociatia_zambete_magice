module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST"),
      port: env.int("DATABASE_PORT"),
      database: env("DATABASE_NAME"),
      user: env("DATABASE_USERNAME"),
      password: env("DATABASE_PASSWORD"),
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: env.int("DATABASE_POOL_MIN", 0),
      max: env.int("DATABASE_POOL_MAX", 3),
      acquireTimeoutMillis: env.int("DATABASE_ACQUIRE_TIMEOUT", 60000),
      createTimeoutMillis: env.int("DATABASE_CREATE_TIMEOUT", 30000),
      destroyTimeoutMillis: env.int("DATABASE_DESTROY_TIMEOUT", 5000),
      idleTimeoutMillis: env.int("DATABASE_IDLE_TIMEOUT", 30000),
    },
    debug: false,
  },
});
