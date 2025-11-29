// Debug script pentru a verifica tabelele și metadata Strapi în Supabase
const { Client } = require("pg");

const client = new Client({
  host: "aws-1-eu-north-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.ajmvymmpwmtivuzgxwdh",
  password: "14081995.IonuttttP",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  // 1. Listare tabele
  const tables = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
  );
  console.log("Tabele existente:", tables.rows);

  // 2. Verificare existență tabele componente
  const compTables = await client.query(
    `SELECT tablename FROM pg_tables WHERE tablename ILIKE '%component%' OR tablename ILIKE '%team%' OR tablename ILIKE '%workstep%' OR tablename ILIKE '%testimonial%';`
  );
  console.log("Tabele componente:", compTables.rows);

  // 3. Verificare tabele de metadata Strapi
  const metaTables = await client.query(
    `SELECT tablename FROM pg_tables WHERE tablename ILIKE 'strapi_%';`
  );
  console.log("Tabele metadata Strapi:", metaTables.rows);

  // 4. Verificare conținut tabele de metadata (dacă există)
  for (const meta of [
    "strapi_components",
    "strapi_database_schema",
    "strapi_migrations_internal",
  ]) {
    try {
      const res = await client.query(`SELECT * FROM ${meta} LIMIT 5;`);
      console.log(`Continut ${meta}:`, res.rows);
    } catch (e) {
      console.log(`Nu există tabela ${meta}`);
    }
  }

  // 5. Verificare permisiuni user
  const perms = await client.query(
    `SELECT has_schema_privilege('postgres', 'public', 'CREATE');`
  );
  console.log("Permisiuni CREATE:", perms.rows);

  await client.end();
}

main().catch(console.error);
