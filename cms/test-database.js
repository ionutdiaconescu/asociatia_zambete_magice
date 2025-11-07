// Test database connection with new configuration
require("dotenv").config();
const knex = require("knex");

async function testDatabaseConnection() {
  console.log("🔍 Testing Database Connection...\n");

  // Load database configuration
  const envHelpers = {
    env: (key, defaultValue) => process.env[key] || defaultValue,
    int: (key, defaultValue) => parseInt(process.env[key]) || defaultValue,
    bool: (key, defaultValue) => process.env[key] === "true" || defaultValue,
  };

  // Create unified env function
  const env = (key, defaultValue) => process.env[key] || defaultValue;
  env.int = (key, defaultValue) => parseInt(process.env[key]) || defaultValue;
  env.bool = (key, defaultValue) => process.env[key] === "true" || defaultValue;

  const databaseConfig = require("./config/database.js")({ env });

  console.log("📋 Database Configuration:");
  console.log(`Host: ${databaseConfig.connection.connection.host}`);
  console.log(`Port: ${databaseConfig.connection.connection.port}`);
  console.log(`Database: ${databaseConfig.connection.connection.database}`);
  console.log(`User: ${databaseConfig.connection.connection.user}`);
  console.log(`Pool min: ${databaseConfig.connection.pool.min}`);
  console.log(`Pool max: ${databaseConfig.connection.pool.max}`);
  console.log(
    `Acquire timeout: ${databaseConfig.connection.pool.acquireTimeoutMillis}ms\n`
  );

  // Test connection
  const db = knex(databaseConfig.connection);

  try {
    console.log("🔌 Attempting to connect...");
    const result = await db.raw("SELECT NOW() as current_time");
    console.log("✅ Database connection successful!");
    console.log(`Current time: ${result.rows[0].current_time}`);

    // Test basic query
    console.log("\n📊 Testing basic queries...");
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%strapi%'
      LIMIT 5
    `);

    console.log(`Found ${tables.rows.length} Strapi tables:`);
    tables.rows.forEach((row) => console.log(`  - ${row.table_name}`));
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error.message);

    if (error.code === "ENOTFOUND") {
      console.error("\n💡 Possible issues:");
      console.error("  - Check DATABASE_HOST environment variable");
      console.error("  - Verify network connectivity to Supabase");
    } else if (error.code === "ECONNREFUSED") {
      console.error("\n💡 Possible issues:");
      console.error("  - Check DATABASE_PORT environment variable");
      console.error("  - Verify Supabase service is running");
    } else if (error.message.includes("timeout")) {
      console.error("\n💡 Timeout issue - try increasing pool timeouts");
    }
  } finally {
    await db.destroy();
    console.log("\n🔚 Connection closed");
  }
}

testDatabaseConnection();
