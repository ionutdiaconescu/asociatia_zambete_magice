#!/usr/bin/env node
require("dotenv").config();

const { Client } = require("pg");

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");

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

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function listPublicTablesWithoutRls(client) {
  const result = await client.query(`
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
      and coalesce(
        (select c.relrowsecurity
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = pg_tables.schemaname
           and c.relname = pg_tables.tablename),
        false
      ) = false
    order by tablename
  `);

  return result.rows;
}

async function enableRls(client, tables) {
  for (const table of tables) {
    const qualifiedTable = `${quoteIdentifier(table.schemaname)}.${quoteIdentifier(table.tablename)}`;
    await client.query(
      `alter table ${qualifiedTable} enable row level security`,
    );
    console.log(`  enabled RLS on ${table.schemaname}.${table.tablename}`);
  }
}

async function main() {
  hydratePgEnvFromUrl();

  const baseConfig = {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    connectionTimeoutMillis: Number(
      process.env.DATABASE_CONNECTION_TIMEOUT || 15000,
    ),
  };

  const client = await connectClient(baseConfig);

  try {
    const current = await client.query(
      "select current_database() as database_name, current_user as user_name",
    );
    const context = current.rows[0];
    console.log(
      `Connected to ${context.database_name} as ${context.user_name}`,
    );

    const tables = await listPublicTablesWithoutRls(client);

    if (tables.length === 0) {
      console.log("No public tables without RLS were found.");
      return;
    }

    console.log("Public tables without RLS:");
    tables.forEach((table) => {
      console.log(`  - ${table.schemaname}.${table.tablename}`);
    });

    if (!shouldApply) {
      console.log(
        "\nDry run only. Re-run with --apply to enable RLS on the tables listed above.",
      );
      return;
    }

    console.log("\nApplying RLS...");
    await enableRls(client, tables);

    const remaining = await listPublicTablesWithoutRls(client);
    console.log(`\nRemaining public tables without RLS: ${remaining.length}`);
    if (remaining.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("RLS fix failed:", error.message);
  process.exit(1);
});
