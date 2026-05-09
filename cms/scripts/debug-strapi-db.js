// Debug script pentru a verifica tabelele și metadata Strapi în Supabase
require("dotenv").config();

const { Client } = require("pg");

function hydratePgEnvFromUrl() {
  if (
    (process.env.DATABASE_USERNAME && process.env.DATABASE_PASSWORD) ||
    !process.env.DATABASE_URL
  ) {
    return;
  }

  try {
    const parsed = new URL(process.env.DATABASE_URL);
    if (!process.env.DATABASE_USERNAME) {
      process.env.DATABASE_USERNAME = parsed.username || "";
    }
    if (!process.env.DATABASE_PASSWORD) {
      process.env.DATABASE_PASSWORD = parsed.password || "";
    }
  } catch (error) {
    console.warn("Could not parse DATABASE_URL:", error.message);
  }
}

function getSslConfig() {
  const rawValue = process.env.DATABASE_SSL;
  const shouldUseSsl =
    rawValue !== undefined
      ? String(rawValue).toLowerCase() === "true"
      : /(supabase|pooler)/i.test(process.env.DATABASE_HOST || "");

  return shouldUseSsl ? { require: true, rejectUnauthorized: false } : false;
}

function shouldRetryWithoutSsl(error, sslConfig) {
  return (
    !!sslConfig &&
    /does not support ssl connections/i.test(error && error.message)
  );
}

async function connectClient(baseConfig) {
  const initialConfig = { ...baseConfig, ssl: getSslConfig() };
  let client = new Client(initialConfig);

  try {
    await client.connect();
    return client;
  } catch (error) {
    await client.end().catch(() => {});

    if (!shouldRetryWithoutSsl(error, initialConfig.ssl)) {
      throw error;
    }

    client = new Client({ ...baseConfig, ssl: false });
    await client.connect();
    return client;
  }
}

const connectionConfig = {
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  connectionTimeoutMillis: Number(
    process.env.DATABASE_CONNECTION_TIMEOUT || 15000,
  ),
};

async function main() {
  hydratePgEnvFromUrl();

  const client = await connectClient(connectionConfig);

  try {
    // 1. Listare tabele
    const tables = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`,
    );
    console.log("Tabele existente:", tables.rows);

    // 2. Verificare existență tabele componente
    const compTables = await client.query(
      `SELECT tablename FROM pg_tables WHERE tablename ILIKE '%component%' OR tablename ILIKE '%team%' OR tablename ILIKE '%workstep%' OR tablename ILIKE '%testimonial%';`,
    );
    console.log("Tabele componente:", compTables.rows);

    // 3. Verificare tabele de metadata Strapi
    const metaTables = await client.query(
      `SELECT tablename FROM pg_tables WHERE tablename ILIKE 'strapi_%';`,
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
      `SELECT has_schema_privilege('postgres', 'public', 'CREATE');`,
    );
    console.log("Permisiuni CREATE:", perms.rows);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
