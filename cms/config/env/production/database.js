module.exports = ({ env }) => {
  const url = env("DATABASE_URL");
  const ssl = env.bool("DATABASE_SSL", true);

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

      // Populate process.env early so any code that reads process.env directly
      // sees consistent credentials.
      try {
        if (!process.env.PGUSER && user) process.env.PGUSER = user;
        if (!process.env.PGPASSWORD && password)
          process.env.PGPASSWORD = password;
        if (!process.env.DATABASE_USERNAME && user)
          process.env.DATABASE_USERNAME = user;
        if (!process.env.DATABASE_PASSWORD && password)
          process.env.DATABASE_PASSWORD = password;
      } catch (e) {
        // ignore
      }

      const result = {
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

      // Fail-fast guard: if the effective user looks like the default 'postgres'
      // (and not the pooler user), throw with a masked message so any process
      // that loads the config will stop and log the reason.
      try {
        const mask = (v) => (v ? "***" : "");
        const effectiveUser = result.connection.connection.user;
        if (!effectiveUser || effectiveUser === "postgres") {
          const msg =
            `DB config guard: refusing to start with user=${effectiveUser || "<empty>"}.` +
            ` Ensure DATABASE_URL contains the pooler username or set PGUSER/PGPASSWORD in env.`;
          console.error(
            "[db-guard]",
            msg,
            "masked_password=",
            mask(result.connection.connection.password)
          );
          throw new Error(msg);
        }
      } catch (e) {
        // rethrow so Strapi fails fast and logs the reason
        throw e;
      }

      return result;
    } catch (e) {
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
