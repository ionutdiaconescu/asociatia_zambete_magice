/*
 Diagnose Supabase DB and Storage alignment with Strapi
 - Verifies Postgres connection and lists relevant tables
 - Counts rows for homepage, campaign, page content types (if tables exist)
 - Verifies Supabase Storage bucket and lists a few files
*/
require("dotenv").config();
const { Client } = require("pg");

async function checkPostgres() {
  const cfg = {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: { rejectUnauthorized: false, require: true },
    connectionTimeoutMillis: Number(
      process.env.DATABASE_CONNECTION_TIMEOUT || 15000
    ),
  };

  const client = new Client(cfg);
  await client.connect();
  const out = { ok: true, tables: [], samples: {} };
  try {
    const who = await client.query(
      "select current_database() as db, current_user as usr"
    );
    out.db = who.rows[0];

    const tablesRes = await client.query(`
      select table_schema, table_name
      from information_schema.tables
      where table_schema = 'public'
        and (
          table_name ilike '%home%page%' or
          table_name ilike '%campaign%' or
          table_name ilike '%page%' or
          table_name ilike '%upload%'
        )
      order by 1,2
    `);
    out.tables = tablesRes.rows;

    async function tryCount(name) {
      try {
        const r = await client.query(`select count(*) from ${name}`);
        return Number(r.rows[0].count);
      } catch (_) {
        return null;
      }
    }

    const candidateTables = [
      "homepages",
      "homepage",
      "campaigns",
      "campaign",
      "pages",
      "page",
      "upload_files",
      "files",
    ];

    for (const t of candidateTables) {
      const c = await tryCount(t);
      if (c !== null) out.samples[t] = c;
    }
  } finally {
    await client.end();
  }
  return out;
}

async function checkStorage() {
  const url = process.env.SUPABASE_API_URL;
  const key = process.env.SUPABASE_API_KEY;
  if (!url || !key)
    return { ok: false, reason: "Missing SUPABASE_API_URL/API_KEY" };

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const out = { ok: true };

  const buckets = await supabase.storage.listBuckets();
  if (buckets.error) return { ok: false, reason: buckets.error.message };
  out.buckets = buckets.data.map((b) => b.name);

  const bucket = process.env.SUPABASE_BUCKET || "uploads";
  out.bucket = bucket;

  const list = await supabase.storage
    .from(bucket)
    .list(process.env.SUPABASE_DIRECTORY || "", { limit: 5 });
  if (list.error) out.listError = list.error.message;
  else out.files = list.data.map((f) => f.name);

  return out;
}

(async () => {
  console.log("🔎 Supabase Diagnostics");
  try {
    const [db, store] = await Promise.allSettled([
      checkPostgres(),
      checkStorage(),
    ]);

    console.log("\nPostgres:");
    if (db.status === "fulfilled") {
      const d = db.value;
      console.log("  ok:", true, "db:", d.db);
      console.log("  tables (subset):", d.tables);
      console.log("  row counts:", d.samples);
    } else {
      console.log(
        "  ok:",
        false,
        "error:",
        (db.reason && db.reason.message) || String(db.reason)
      );
    }

    console.log("\nStorage:");
    if (store.status === "fulfilled") {
      const s = store.value;
      console.log("  ok:", s.ok, "buckets:", s.buckets);
      console.log("  bucket:", s.bucket);
      if (s.listError) console.log("  list error:", s.listError);
      if (s.files) console.log("  files (first 5):", s.files);
    } else {
      console.log(
        "  ok:",
        false,
        "error:",
        (store.reason && store.reason.message) || String(store.reason)
      );
    }
  } catch (e) {
    console.error("Diagnostics error:", e.message);
    process.exitCode = 1;
  }
})();
