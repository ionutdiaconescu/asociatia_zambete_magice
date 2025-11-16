/**
 * Direct SQL script to grant public permissions
 * Run this with: node scripts/grant-permissions-sql.js
 */

require("dotenv").config();
const { Client } = require("pg");

async function grantPermissions() {
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

    // 2. Define permissions to grant
    const permissions = [
      "api::homepage.homepage.find",
      "api::homepage.homepage.findOne",
      "api::campanie-de-donatii.campanie-de-donatii.find",
      "api::campanie-de-donatii.campanie-de-donatii.findOne",
    ];

    console.log("🔧 Granting permissions...\n");

    for (const action of permissions) {
      // Check if permission exists
      const existing = await client.query(
        "SELECT * FROM up_permissions WHERE action = $1 AND role = $2 LIMIT 1",
        [action, roleId]
      );

      if (existing.rows.length === 0) {
        // Create new permission - Strapi v5 schema doesn't have 'enabled' column
        // Existence of row means it's enabled
        await client.query(
          "INSERT INTO up_permissions (action, role, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())",
          [action, roleId]
        );
        console.log(`✅ Created: ${action}`);
      } else {
        console.log(`⏭️  Already exists: ${action}`);
      }
    }

    // 3. Publish homepage
    console.log("\n🔧 Publishing homepage...\n");
    const homepageResult = await client.query(
      "UPDATE homepages SET published_at = NOW(), updated_at = NOW() WHERE published_at IS NULL RETURNING id"
    );

    if (homepageResult.rowCount > 0) {
      console.log(`✅ Published ${homepageResult.rowCount} homepage(s)`);
    } else {
      console.log("ℹ️  Homepage already published or doesn't exist");
    }

    console.log("\n🎉 Setup complete!\n");
    console.log("Test these URLs:");
    console.log(
      "  - https://asociatia-zambete-magice.onrender.com/api/homepage?populate=*"
    );
    console.log(
      "  - https://asociatia-zambete-magice.onrender.com/api/campanie-de-donatiis?populate=coverImage"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

grantPermissions();
