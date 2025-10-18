// Evaluate cms/config/database.js using the current process.env and print a masked connection preview
const path = require("path");
try {
  const nodeEnv = process.env.NODE_ENV || "development";
  const envCfgPath = path.join(
    __dirname,
    "..",
    "config",
    "env",
    nodeEnv,
    "database.js"
  );
  const cfgPath = path.join(__dirname, "..", "config", "database.js");
  let dbConfigFactory;
  try {
    dbConfigFactory = require(envCfgPath);
    console.log("[print-db-config] using", envCfgPath);
  } catch (errEnv) {
    try {
      dbConfigFactory = require(cfgPath);
      console.log("[print-db-config] using", cfgPath);
    } catch (errCfg) {
      console.error(
        "[print-db-config] error evaluating database config: Cannot find module",
        envCfgPath,
        cfgPath
      );
      process.exit(0);
      return;
    }
  }

  // Create an env function compatible with Strapi's config({ env }) signature
  const env = function (k, d) {
    return process.env[k] !== undefined ? process.env[k] : d;
  };
  env.bool = function (k, d) {
    const v = process.env[k];
    if (v === undefined) return d;
    return String(v).toLowerCase() === "true";
  };
  env.int = function (k, d) {
    const v = process.env[k];
    if (v === undefined) return d;
    const n = parseInt(String(v), 10);
    return Number.isNaN(n) ? d : n;
  };

  const result = dbConfigFactory({ env });

  // Mask password if present; also mask any password inside a connectionString
  try {
    const conn = result && result.connection && result.connection.connection;
    if (conn) {
      if (typeof conn === "string") {
        // If someone returned a raw connection string
        conn = { connectionString: conn };
      }

      // Mask explicit password field
      if (conn.password) conn.password = "***";
      if (conn.connection && conn.connection.password)
        conn.connection.password = "***";

      // Mask connectionString embedded password
      const connStr =
        (conn.connection && conn.connection.connectionString) ||
        conn.connectionString;
      if (connStr && typeof connStr === "string") {
        // Replace :password@ with :***@ (keeps username visible)
        const masked = connStr.replace(/:\/\/([^:\/]+):([^@]+)@/, "// $1:***@");
        if (conn.connection && conn.connection.connectionString)
          conn.connection.connectionString = masked;
        else if (conn.connectionString) conn.connectionString = masked;
      }
    }
  } catch (e) {
    // ignore
  }

  console.log("[print-db-config] evaluated database config:");
  // Print the result safely
  console.log(JSON.stringify(result, null, 2));

  // Also print runtime env vars that commonly override pg credentials
  try {
    const sensitive = (k) => (process.env[k] ? "***" : "(unset)");
    console.log(
      "[print-db-config] runtime overrides: PGUSER=",
      process.env.PGUSER || "(unset)",
      " PGPASSWORD=",
      process.env.PGPASSWORD ? "***" : "(unset)",
      " DATABASE_USERNAME=",
      process.env.DATABASE_USERNAME || "(unset)",
      " DATABASE_PASSWORD=",
      process.env.DATABASE_PASSWORD ? "***" : "(unset)"
    );
  } catch (e) {
    // ignore
  }
} catch (e) {
  console.error(
    "[print-db-config] error evaluating database config:",
    e && e.message
  );
}
