module.exports = ({ env }) => {
  const url = env("DATABASE_URL");
  const ssl = env.bool("DATABASE_SSL", true);

  // If DATABASE_URL is provided, parse it into explicit fields to avoid
  // ambiguity between connectionString vs individual fields.
  if (url) {
    try {
      const parsed = new URL(url);
      const user = parsed.username || env("DATABASE_USERNAME", env("PGUSER"));
      const password =
        parsed.password || env("DATABASE_PASSWORD", env("PGPASSWORD"));
      const host = parsed.hostname;
      const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
      const database = parsed.pathname
        ? parsed.pathname.replace(/^\//, "")
        : env("DATABASE_NAME", "postgres");

      return {
        connection: {
          client: "postgres",
          connection: {
            host,
            port,
            database,
            user,
            password,
            ssl: ssl ? { rejectUnauthorized: false } : false,
          },
        },
      };
    } catch (e) {
      // Fall back to connectionString if parsing fails
      return {
        connection: {
          client: "postgres",
          connection: {
            connectionString: url,
            ssl: ssl ? { rejectUnauthorized: false } : false,
          },
        },
      };
    }
  }

  // If no DATABASE_URL provided, fall back to env-derived fields
  return {
    connection: {
      client: "postgres",
      connection: {
        host: env("DATABASE_HOST", "127.0.0.1"),
        port: env.int("DATABASE_PORT", 5432),
        database: env("DATABASE_NAME", "postgres"),
        user: env("DATABASE_USERNAME", env("PGUSER", "postgres")),
        password: env("DATABASE_PASSWORD", env("PGPASSWORD", "")),
        ssl: ssl ? { rejectUnauthorized: false } : false,
      },
    },
  };
};
