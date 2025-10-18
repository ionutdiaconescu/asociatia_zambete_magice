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

  const result = dbConfigFactory({ env });

  // Mask password if present
  try {
    const conn = result && result.connection && result.connection.connection;
    if (conn && typeof conn === "object") {
      if (conn.password) conn.password = "***";
      if (conn.connection && conn.connection.password)
        conn.connection.password = "***";
    }
  } catch (e) {
    // ignore
  }

  console.log("[print-db-config] evaluated database config:");
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(
    "[print-db-config] error evaluating database config:",
    e && e.message
  );
}
