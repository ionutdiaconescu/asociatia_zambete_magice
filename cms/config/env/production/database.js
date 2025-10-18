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

      // Populate process.env early so any code that reads process.env directly
      // (before our startup scripts run) sees consistent credentials.
      try {
        if (!process.env.PGUSER && user) process.env.PGUSER = user;
        if (!process.env.PGPASSWORD && password)
          process.env.PGPASSWORD = password;
        if (!process.env.DATABASE_USERNAME && user)
          process.env.DATABASE_USERNAME = user;
        if (!process.env.DATABASE_PASSWORD && password)
          process.env.DATABASE_PASSWORD = password;
      // Export a concrete object using process.env so Strapi receives a defined
      // connection object immediately when requiring the file (avoid timing issues).
      const url = process.env.DATABASE_URL;
      const sslEnabled = (() => {
        const v = process.env.DATABASE_SSL;
        if (v === undefined) return true;
        return String(v).toLowerCase() === "true";
      })();

      function makeFromUrl(u) {
        try {
          const parsed = new URL(u);
          const user = parsed.username || process.env.DATABASE_USERNAME || process.env.PGUSER;
          const password = parsed.password || process.env.DATABASE_PASSWORD || process.env.PGPASSWORD;
          const host = parsed.hostname;
          const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
          const database = parsed.pathname ? parsed.pathname.replace(/^\//, "") : process.env.DATABASE_NAME || "postgres";

          // Populate process.env early so any code that reads process.env directly
          // sees consistent credentials.
          try {
            if (!process.env.PGUSER && user) process.env.PGUSER = user;
            if (!process.env.PGPASSWORD && password) process.env.PGPASSWORD = password;
            if (!process.env.DATABASE_USERNAME && user) process.env.DATABASE_USERNAME = user;
            if (!process.env.DATABASE_PASSWORD && password) process.env.DATABASE_PASSWORD = password;
          } catch (e) {
            // ignore
          }

          return {
            client: "postgres",
            connection: {
              host,
              port,
              database,
              user,
              password,
              ssl: sslEnabled ? { rejectUnauthorized: false } : false,
            },
          };
        } catch (e) {
          return null;
        }
      }

      let cfg;
      if (url) {
        cfg = makeFromUrl(url) || { client: "postgres", connection: { connectionString: url, ssl: sslEnabled ? { rejectUnauthorized: false } : false } };
      } else {
        cfg = {
          client: "postgres",
          connection: {
            host: process.env.DATABASE_HOST || "127.0.0.1",
            port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
            database: process.env.DATABASE_NAME || "postgres",
            user: process.env.DATABASE_USERNAME || process.env.PGUSER || "postgres",
            password: process.env.DATABASE_PASSWORD || process.env.PGPASSWORD || "",
            ssl: sslEnabled ? { rejectUnauthorized: false } : false,
          },
        };
      }

      module.exports = {
        connection: cfg,
      };
