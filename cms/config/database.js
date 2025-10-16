module.exports = ({ env }) => {
  const client = env("DATABASE_CLIENT", "postgres");
  const url = env("DATABASE_URL");
  const ssl = env.bool("DATABASE_SSL", true);
  try {
    // Helpful debug logs for Render deploys — will appear in build/runtime logs
    // Mask password when logging the URL
    const safeUrl = url ? url.replace(/:[^:@]+@/, ":***@") : url;
    console.log("[db-config] DATABASE_CLIENT=", client);
    console.log("[db-config] DATABASE_URL=", safeUrl);
    // Parse and log the username part from the URL so we can confirm which DB user is used
    try {
      const m = url && url.match(/^postgres(?:ql)?:\/\/([^:@]+)(?::|@)/i);
      const dbUser = m ? m[1] : undefined;
      console.log("[db-config] DB_USER=", dbUser || "(none)");
    } catch (e) {
      console.log("[db-config] DB_USER= (parse-error)");
    }
    console.log("[db-config] DATABASE_SSL=", ssl);
  } catch (e) {
    // swallow logging errors to avoid breaking startup
  }
  if (client !== "postgres") {
    throw new Error("Only Postgres is supported in this deployment!");
  }
  if (!url) {
    throw new Error("DATABASE_URL is not set!");
  }
  // Parse the DATABASE_URL and provide explicit connection fields to the pg client.
  // This avoids ambiguity where some environments or drivers may prefer separate fields.
  try {
    const parsed = new URL(url);
    const dbHost = parsed.hostname;
    const dbPort = parsed.port || 5432;
    const dbName = parsed.pathname
      ? parsed.pathname.replace(/^\//, "")
      : undefined;
    // Prefer explicit env overrides for username/password if present
    const parsedUser = parsed.username || undefined;
    const parsedPassword = parsed.password || undefined;
    const envUser = env("DATABASE_USERNAME", parsedUser);
    const envPassword = env("DATABASE_PASSWORD", parsedPassword);

    const connectionObj = {
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: envUser,
      password: envPassword,
      ssl: ssl ? { rejectUnauthorized: false } : false,
    };

    // Log a masked preview of the parsed connection object so we can confirm
    try {
      const maskedUser = connectionObj.user || "(none)";
      const maskedHost = connectionObj.host || "(none)";
      console.log(
        "[db-config] parsed connection -> user=",
        maskedUser,
        ", host=",
        maskedHost,
        ", db=",
        connectionObj.database
      );
      // If the parsed user differs from the env override, log that we overrode it
      if (parsedUser && envUser && parsedUser !== envUser) {
        try {
          console.log(
            "[db-config] INFO: DATABASE_USERNAME override in effect. parsedUser=",
            parsedUser,
            "-> using=",
            envUser
          );
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }

    // Return explicit connection fields (do not pass connectionString to avoid driver fallbacks)
    return {
      connection: {
        client: "postgres",
        connection: connectionObj,
      },
    };
  } catch (e) {
    // If parsing fails, fall back to connectionString
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
};
