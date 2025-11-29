// Deep Strapi DB debug script
const { Client } = require("pg");

const config = {
  host: "aws-1-eu-north-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.ajmvymmpwmtivuzgxwdh",
  password: "14081995.IonuttttP",
  ssl: { rejectUnauthorized: false },
};

async function main() {
  const client = new Client(config);
  await client.connect();

  // List all tables
  const tables = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
  );
  console.log("Tabele:", tables.rows);

  // List all columns for each table
  for (const { tablename } of tables.rows) {
    const columns = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tablename}';`
    );
    console.log(`Coloane pentru ${tablename}:`, columns.rows);
  }

  // Check for Strapi metadata tables
  const metaTables = await client.query(
    `SELECT tablename FROM pg_tables WHERE tablename ILIKE '%strapi%' ORDER BY tablename;`
  );
  console.log("Tabele metadata Strapi:", metaTables.rows);

  // Check for component tables and links
  const compTables = await client.query(
    `SELECT tablename FROM pg_tables WHERE tablename ILIKE '%component%' OR tablename ILIKE '%team%' OR tablename ILIKE '%workstep%' ORDER BY tablename;`
  );
  console.log("Tabele componente:", compTables.rows);

  // Check for links tables (media relations)
  const linkTables = await client.query(
    `SELECT tablename FROM pg_tables WHERE tablename ILIKE '%link%' ORDER BY tablename;`
  );
  console.log("Tabele de legătură:", linkTables.rows);

  await client.end();
}

main().catch(console.error);
