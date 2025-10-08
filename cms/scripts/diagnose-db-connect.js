#!/usr/bin/env node
/**
 * Diagnose Supabase / Postgres connectivity issues (IPv4 vs IPv6 vs timeout).
 * Usage:
 *   node scripts/diagnose-db-connect.js
 * Env vars used (or prompt fallback):
 *   DIAG_DB_HOST, DIAG_DB_USER, DIAG_DB_PASSWORD, DIAG_DB_NAME
 */
const dns = require("dns");
const { Client } = require("pg");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ask(q, def) {
  return new Promise((res) => {
    rl.question(`${q}${def ? ` (${def})` : ""}: `, (ans) =>
      res(ans || def || "")
    );
  });
}

(async () => {
  const host =
    process.env.DIAG_DB_HOST ||
    (await ask("Host", "db.gbzwxjdsinimqdgkvtsu.supabase.co"));
  const user = process.env.DIAG_DB_USER || (await ask("User", "postgres"));
  const password =
    process.env.DIAG_DB_PASSWORD ||
    (await ask("Password (input hidden not implemented, will echo)", ""));
  const database =
    process.env.DIAG_DB_NAME || (await ask("Database", "postgres"));

  console.log("\n=== DNS Resolution ===");
  try {
    const all = await dns.promises.lookup(host, { all: true });
    console.log("dns.lookup(all):", all);
  } catch (e) {
    console.error("lookup failed:", e.message);
  }
  try {
    const v4 = await dns.promises.resolve4(host);
    console.log("resolve4:", v4);
  } catch (e) {
    console.error("resolve4 failed:", e.code || e.message);
  }
  try {
    const v6 = await dns.promises.resolve6(host);
    console.log("resolve6:", v6);
  } catch (e) {
    console.error("resolve6 failed:", e.code || e.message);
  }

  async function testDirect(ip, family) {
    const client = new Client({
      host: ip,
      port: 5432,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      statement_timeout: 5000,
      connectionTimeoutMillis: 5000,
    });
    const label = `${ip} (${family})`;
    process.stdout.write(`\nTrying direct connect ${label} ... `);
    const start = Date.now();
    try {
      await client.connect();
      const nowRes = await client.query("SELECT NOW() as now");
      const dur = Date.now() - start;
      console.log(`SUCCESS in ${dur}ms -> ${nowRes.rows[0].now}`);
      await client.end();
    } catch (e) {
      const dur = Date.now() - start;
      console.log(`FAIL in ${dur}ms -> ${e.code || e.message}`);
    }
  }

  // Try each resolved address manually (if any)
  try {
    const all = await dns.promises.lookup(host, { all: true });
    for (const entry of all) {
      await testDirect(entry.address, entry.family === 6 ? "IPv6" : "IPv4");
    }
  } catch (e) {
    console.error("Skipping direct per-address tests (lookup failed).");
  }

  // Normal host attempt
  console.log("\n=== Normal host connect attempt ===");
  await testDirect(host, "original-host");

  rl.close();
})();
