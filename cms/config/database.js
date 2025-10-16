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
