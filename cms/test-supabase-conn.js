const { Client } = require("pg");
const client = new Client({
  connectionString:
    "postgresql://postgres.ajmvymmpwmtivuzgxwdh:14081995.IonuttttP@aws-1-eu-north-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
});
client
  .connect()
  .then(() => {
    console.log("✅ Conexiune reușită!");
    return client.end();
  })
  .catch((err) => {
    console.error("❌ Eroare:", err.message);
  });
