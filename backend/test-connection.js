const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://postgres.gbzwxjdsinimqdgkvtsu:14081995.IonuttttS@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    console.log("🔄 Testing Supabase connection...");
    const client = await pool.connect();

    console.log("✅ Connected to Supabase!");

    const result = await client.query("SELECT NOW() as current_time");
    console.log("🕐 Database time:", result.rows[0].current_time);

    client.release();
    console.log("✅ Connection test successful!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.error("Code:", error.code);
    process.exit(1);
  }
}

testConnection();
