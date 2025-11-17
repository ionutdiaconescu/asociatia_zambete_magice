/**
 * Diagnose production database state
 * Run: node scripts/diagnose-production-db.js
 */

require("dotenv").config();
const { Client } = require("pg");

async function diagnose() {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to production database\n");

    // 1. Check if tables exist
    console.log("1️⃣ CHECKING TABLES:");
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%permission%' OR table_name LIKE '%role%' OR table_name LIKE '%homepage%' OR table_name LIKE '%campanie%'
      ORDER BY table_name
    `);
    tables.rows.forEach((row) => console.log(`   - ${row.table_name}`));

    // 2. Check public role
    console.log("\n2️⃣ PUBLIC ROLE:");
    const role = await client.query(
      "SELECT * FROM up_roles WHERE type = 'public'"
    );
    if (role.rows.length > 0) {
      console.log(`   ✅ Public role exists (ID: ${role.rows[0].id})`);
    } else {
      console.log("   ❌ Public role NOT FOUND!");
    }

    // 3. Check permissions
    console.log("\n3️⃣ PERMISSIONS:");
    const perms = await client.query(`
      SELECT id, action FROM up_permissions 
      WHERE action LIKE '%homepage%' OR action LIKE '%campanie%'
      ORDER BY action
    `);
    if (perms.rows.length > 0) {
      perms.rows.forEach((p) => console.log(`   - ${p.action} (ID: ${p.id})`));
    } else {
      console.log("   ⚠️  No homepage/campaign permissions found");
    }

    // 4. Check permission-role links
    console.log("\n4️⃣ PERMISSION-ROLE LINKS:");
    const links = await client.query(`
      SELECT l.*, p.action 
      FROM up_permissions_role_lnk l
      JOIN up_permissions p ON l.permission_id = p.id
      WHERE p.action LIKE '%homepage%' OR p.action LIKE '%campanie%'
    `);
    if (links.rows.length > 0) {
      links.rows.forEach((l) =>
        console.log(`   - ${l.action} → role ${l.role_id}`)
      );
    } else {
      console.log("   ⚠️  No permission links for homepage/campaigns");
    }

    // 5. Check homepage content
    console.log("\n5️⃣ HOMEPAGE CONTENT:");
    const hp = await client.query(
      "SELECT id, published_at FROM homepages LIMIT 1"
    );
    if (hp.rows.length > 0) {
      console.log(
        `   ✅ Homepage exists (ID: ${hp.rows[0].id}, published: ${!!hp.rows[0].published_at})`
      );
    } else {
      console.log("   ❌ Homepage entry NOT FOUND!");
    }

    // 6. Check campaigns
    console.log("\n6️⃣ CAMPAIGNS:");
    const campaigns = await client.query(
      "SELECT COUNT(*) FROM campanie_de_donatiis"
    );
    console.log(`   Found ${campaigns.rows[0].count} campaign(s)`);

    console.log("\n" + "=".repeat(60));
    console.log("\n📊 SUMMARY:");
    console.log("   - Tables: OK");
    console.log(`   - Public role: ${role.rows.length > 0 ? "✅" : "❌"}`);
    console.log(
      `   - Permissions: ${perms.rows.length > 0 ? "✅" : "⚠️  Missing"}`
    );
    console.log(
      `   - Permission links: ${links.rows.length > 0 ? "✅" : "⚠️  Missing"}`
    );
    console.log(`   - Homepage: ${hp.rows.length > 0 ? "✅" : "❌"}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

diagnose();
