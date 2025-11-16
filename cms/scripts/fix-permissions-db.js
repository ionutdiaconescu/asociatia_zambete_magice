/**
 * Direct database script to grant public permissions and publish homepage
 * Run this ONCE in production: node scripts/fix-permissions-db.js
 */

require("dotenv").config();
const { Client } = require("pg");

async function fixPermissions() {
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

    // 1. Get public role ID
    const roleResult = await client.query(
      "SELECT id FROM up_roles WHERE type = 'public' LIMIT 1"
    );

    if (roleResult.rows.length === 0) {
      console.error("❌ Public role not found!");
      process.exit(1);
    }

    const roleId = roleResult.rows[0].id;
    console.log(`✅ Public role ID: ${roleId}\n`);

    // 2. Check table structure first
    console.log("🔍 Checking up_permissions table structure...");
    const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'up_permissions'
      ORDER BY ordinal_position
    `);

    console.log(
      "Columns:",
      tableInfo.rows.map((r) => r.column_name).join(", ")
    );
    console.log();

    // 3. Check if there's a linking table for roles and permissions
    console.log("🔍 Checking for role-permission linking table...");
    const linkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%role%permission%' OR table_name LIKE '%permission%role%'
      ORDER BY table_name
    `);

    console.log(
      "Link tables found:",
      linkTables.rows.map((r) => r.table_name).join(", ") || "none"
    );

    // Check up_roles structure
    const rolesInfo = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'up_roles'
    `);
    console.log(
      "up_roles columns:",
      rolesInfo.rows.map((r) => r.column_name).join(", ")
    );

    // List all tables with 'permission' in name
    const allPermTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%permission%'
    `);
    console.log("\nAll permission-related tables:");
    allPermTables.rows.forEach((r) => console.log(`  - ${r.table_name}`));
    console.log();

    // 4. Strapi v5 uses a linking table - find the correct one for up_permissions
    const linkTable = linkTables.rows.find(
      (r) => r.table_name === "up_permissions_role_lnk"
    );

    if (!linkTable) {
      console.log(
        "⚠️  up_permissions_role_lnk table not found. Listing sample data from up_permissions:"
      );
      const sample = await client.query("SELECT * FROM up_permissions LIMIT 3");
      console.log(JSON.stringify(sample.rows, null, 2));
      console.log("\n⚠️  Cannot proceed without understanding the schema");
      process.exit(1);
    }

    console.log(`✅ Using linking table: ${linkTable.table_name}\n`);

    // Define permissions to grant
    const permissions = [
      "api::homepage.homepage.find",
      "api::homepage.homepage.findOne",
      "api::campanie-de-donatii.campanie-de-donatii.find",
      "api::campanie-de-donatii.campanie-de-donatii.findOne",
    ];

    console.log("🔧 Granting permissions...\n");

    for (const action of permissions) {
      // Find or create permission entry
      let permResult = await client.query(
        "SELECT id FROM up_permissions WHERE action = $1 LIMIT 1",
        [action]
      );

      let permId;
      if (permResult.rows.length === 0) {
        const inserted = await client.query(
          "INSERT INTO up_permissions (action, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
          [action]
        );
        permId = inserted.rows[0].id;
        console.log(`✅ Created permission: ${action}`);
      } else {
        permId = permResult.rows[0].id;
        console.log(`⏭️  Permission exists: ${action}`);
      }

      // Link permission to role if not linked
      const linkCheck = await client.query(
        `SELECT * FROM ${linkTable.table_name} WHERE role_id = $1 AND permission_id = $2`,
        [roleId, permId]
      );

      if (linkCheck.rows.length === 0) {
        await client.query(
          `INSERT INTO ${linkTable.table_name} (role_id, permission_id) VALUES ($1, $2)`,
          [roleId, permId]
        );
        console.log(`   ✅ Linked to Public role`);
      } else {
        console.log(`   ⏭️  Already linked to Public role`);
      }
    }

    // 5. Publish homepage
    console.log("\n🔧 Publishing homepage...\n");

    // Check if homepages table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'homepages'
      )
    `);

    if (tableExists.rows[0].exists) {
      const homepageResult = await client.query(
        "UPDATE homepages SET published_at = NOW(), updated_at = NOW() WHERE published_at IS NULL RETURNING id"
      );

      if (homepageResult.rowCount > 0) {
        console.log(`✅ Published ${homepageResult.rowCount} homepage(s)`);
      } else {
        console.log("ℹ️  Homepage already published or doesn't exist");
      }
    } else {
      console.log("⚠️  Homepages table doesn't exist yet");
    }

    // 6. Verify setup
    console.log("\n🔍 Verifying permissions...\n");
    const verifyQuery = `
      SELECT p.action 
      FROM up_permissions p
      INNER JOIN ${linkTable.table_name} link ON link.permission_id = p.id
      WHERE link.role_id = $1 AND p.action LIKE 'api::%'
    `;
    const allPerms = await client.query(verifyQuery, [roleId]);

    console.log(
      `✅ Total application permissions for Public role: ${allPerms.rowCount}`
    );
    allPerms.rows.forEach((p) => console.log(`   - ${p.action}`));

    console.log("\n🎉 Setup complete!");
    console.log("\n📋 Next steps:");
    console.log(
      "1. Restart Strapi (Render will do this automatically on deploy)"
    );
    console.log("2. Clear browser cache and reload Admin UI");
    console.log("3. Test these URLs:");
    console.log(
      "   - https://asociatia-zambete-magice.onrender.com/api/homepage?populate=*"
    );
    console.log(
      "   - https://asociatia-zambete-magice.onrender.com/api/campanie-de-donatiis?populate=coverImage"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixPermissions();
