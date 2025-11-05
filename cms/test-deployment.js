require("dotenv").config();
const path = require("path");

console.log("=== DEPLOYMENT DIAGNOSTIC ===");
console.log("Node version:", process.version);
console.log("Platform:", process.platform);
console.log("CWD:", process.cwd());

// Test environment variables
console.log("\n=== ENVIRONMENT VARIABLES ===");
const requiredVars = [
  "DATABASE_HOST",
  "DATABASE_PORT",
  "DATABASE_NAME",
  "DATABASE_USERNAME",
  "DATABASE_PASSWORD",
  "ADMIN_JWT_SECRET",
  "API_TOKEN_SALT",
  "TRANSFER_TOKEN_SALT",
];

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? "✓ SET" : "✗ MISSING"}`);
});

// Test build directory
console.log("\n=== BUILD DIRECTORY ===");
const buildPath = path.join(__dirname, "dist", "build");
const fs = require("fs");

try {
  const buildExists = fs.existsSync(buildPath);
  console.log(`Build path: ${buildPath}`);
  console.log(`Build exists: ${buildExists ? "✓ YES" : "✗ NO"}`);

  if (buildExists) {
    const indexPath = path.join(buildPath, "index.html");
    const indexExists = fs.existsSync(indexPath);
    console.log(`index.html exists: ${indexExists ? "✓ YES" : "✗ NO"}`);

    if (indexExists) {
      const stats = fs.statSync(indexPath);
      console.log(`index.html size: ${stats.size} bytes`);
    }
  }
} catch (error) {
  console.log("Error checking build:", error.message);
}

// Test admin config
console.log("\n=== ADMIN CONFIG ===");
try {
  const adminConfig = require("./config/admin.js");
  const config = adminConfig({
    env: (key, defaultValue) => process.env[key] || defaultValue,
  });
  console.log("Admin config loaded successfully");
  console.log("serveAdminPanel:", config.serveAdminPanel);
  console.log("buildPath:", config.buildPath);
  console.log("url:", config.url);
} catch (error) {
  console.log("Error loading admin config:", error.message);
}

// Test database config
console.log("\n=== DATABASE CONFIG ===");
try {
  const dbConfig = require("./config/database.js");
  const config = dbConfig({
    env: (key, defaultValue) => process.env[key] || defaultValue,
    int: (key, defaultValue) => parseInt(process.env[key]) || defaultValue,
  });
  console.log("Database config loaded successfully");
  console.log("Client:", config.connection.client);
  console.log(
    "Host:",
    config.connection.connection.host ? "✓ SET" : "✗ MISSING"
  );
  console.log("Port:", config.connection.connection.port);
  console.log(
    "Database:",
    config.connection.connection.database ? "✓ SET" : "✗ MISSING"
  );
} catch (error) {
  console.log("Error loading database config:", error.message);
}

console.log("\n=== DIAGNOSTIC COMPLETE ===");
