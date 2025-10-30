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

  // Asigură-te că dbConfigFactory este funcție
  let result;
  if (typeof dbConfigFactory === "function") {
    result = dbConfigFactory({ env });
  } else {
    console.error(
      "[print-db-config] error: config/database.js nu exportă o funcție!"
    );
    result = dbConfigFactory;
  }

  // Mask password if present; also mask any password inside a connectionString
  // Pentru log, clonează configul și maschează doar parola, fără a modifica obiectul original
  let maskedResult;
  try {
    maskedResult = JSON.parse(JSON.stringify(result));
    if (
      maskedResult &&
      maskedResult.connection &&
      maskedResult.connection.connection &&
      typeof maskedResult.connection.connection === "object"
    ) {
      if (maskedResult.connection.connection.password)
        maskedResult.connection.connection.password = "***";
    }
  } catch (e) {
    maskedResult = result;
  }

  console.log("[print-db-config] evaluated database config:");
  // Print the result safely
  console.log(JSON.stringify(result, null, 2));

  // Scrie configul evaluat într-un fișier pentru debugging pe Render
  try {
    const fs = require("fs");
    const outPath = "/tmp/strapi-db-config.json";
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`[print-db-config] config scris la ${outPath}`);
  } catch (e) {
    console.error(
      "[print-db-config] nu pot scrie /tmp/strapi-db-config.json:",
      e && e.message
    );
  }

  // Afișează doar DATABASE_USERNAME și DATABASE_PASSWORD
  try {
    console.log(
      "[print-db-config] runtime overrides: DATABASE_USERNAME=",
      process.env.DATABASE_USERNAME || "(unset)",
      "DATABASE_PASSWORD=",
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
