/**
 * Clean and rebuild permissions
 * This will delete ALL permissions and let Strapi recreate them on next startup
 * Run: node scripts/clean-rebuild-permissions.js
 */

require("dotenv").config();
const { Client } = require("pg");

async function cleanRebuild() {
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
    console.log("✅ Connected to database\n");

    console.log("⚠️  DESPRE SĂ ȘTERG TOATE PERMISIUNILE!");
    console.log("Strapi le va recrea automat la următoarea pornire.\n");

    // 1. Delete permission-role links
    console.log("1️⃣ Deleting permission-role links...");
    const deletedLinks = await client.query(
      "DELETE FROM up_permissions_role_lnk RETURNING *"
    );
    console.log(`   Deleted ${deletedLinks.rowCount} links\n`);

    // 2. Delete all permissions
    console.log("2️⃣ Deleting all permissions...");
    const deletedPerms = await client.query(
      "DELETE FROM up_permissions RETURNING *"
    );
    console.log(`   Deleted ${deletedPerms.rowCount} permissions\n`);

    console.log("✅ DONE!");
    console.log("\n📋 NEXT STEPS:");
    console.log("   1. Restart Strapi (pe Render sau local)");
    console.log("   2. Strapi va recrea automat toate permisiunile");
    console.log("   3. Mergi la Admin UI → Settings → Roles → Public");
    console.log("   4. Acum ar trebui să vezi Homepage și Campanie-de-donatii");
    console.log("   5. Bifează find & findOne pentru ambele");
    console.log("   6. Save");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanRebuild();
