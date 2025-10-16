const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// Try to load dotenv if present so we can run this locally without exporting env
try {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
} catch (e) {
  // ignore if dotenv not installed
}

const conn = process.env.DATABASE_URL;
console.log(
  "[test-db] Using DATABASE_URL from env:",
  conn ? "(present)" : "(missing)"
);
if (!conn) {
  console.error(
    "[test-db] No DATABASE_URL found. Please set process.env.DATABASE_URL or add it to cms/.env"
  );
  process.exit(1);
}

(async () => {
  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const res = await client.query("SELECT NOW() as now");
    console.log("[test-db] Connected OK. Server time:", res.rows[0].now);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error("[test-db] Connection error:");
    console.error(err);
    // Print helpful hints for common auth issues
    if (err.message && err.message.includes("password authentication failed")) {
      console.error(
        "[test-db] Hint: password authentication failed. Check that the username and password in DATABASE_URL are correct and URL-encoded."
      );
    }
    process.exit(2);
  }
})();
