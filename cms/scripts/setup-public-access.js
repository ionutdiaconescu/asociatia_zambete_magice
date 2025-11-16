/**
 * One-time script to publish homepage and grant public permissions
 * Run this directly in production: node scripts/setup-public-access.js
 */

const strapi = require("@strapi/strapi").default;

async function setupPublicAccess() {
  console.log("🚀 Starting public access setup...\n");

  const instance = await strapi().load();

  try {
    // 1. Find Public role
    console.log("1️⃣ Finding Public role...");
    const publicRole = await instance
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "public" },
      });

    if (!publicRole) {
      console.error("❌ Public role not found!");
      process.exit(1);
    }
    console.log(`✅ Public role found (ID: ${publicRole.id})\n`);

    // 2. Grant permissions for all content types
    console.log("2️⃣ Granting permissions for content types...");
    const contentTypes = Object.keys(instance.contentTypes).filter((ct) =>
      ct.startsWith("api::")
    );

    console.log(`Found ${contentTypes.length} content types:`, contentTypes);

    for (const ct of contentTypes) {
      const actions = [`${ct}.find`, `${ct}.findOne`];

      for (const action of actions) {
        const existing = await instance
          .query("plugin::users-permissions.permission")
          .findOne({
            where: { action, role: publicRole.id },
          });

        if (!existing) {
          await instance.query("plugin::users-permissions.permission").create({
            data: {
              action,
              role: publicRole.id,
              enabled: true,
            },
          });
          console.log(`  ✅ Granted: ${action}`);
        } else if (!existing.enabled) {
          await instance.query("plugin::users-permissions.permission").update({
            where: { id: existing.id },
            data: { enabled: true },
          });
          console.log(`  ✅ Enabled: ${action}`);
        } else {
          console.log(`  ⏭️  Already enabled: ${action}`);
        }
      }
    }

    // 3. Publish homepage if exists
    console.log("\n3️⃣ Checking homepage publication...");
    try {
      const homepage = await instance
        .documents("api::homepage.homepage")
        .findFirst();

      if (homepage) {
        if (!homepage.publishedAt) {
          await instance.documents("api::homepage.homepage").update({
            documentId: homepage.documentId,
            data: { publishedAt: new Date() },
          });
          console.log("✅ Homepage published");
        } else {
          console.log("✅ Homepage already published");
        }
      } else {
        console.log("⚠️  Homepage entry not found - create one in Admin UI");
      }
    } catch (e) {
      console.log(`⚠️  Homepage error: ${e.message}`);
    }

    // 4. Verify setup
    console.log("\n4️⃣ Verifying setup...");
    const allPermissions = await instance
      .query("plugin::users-permissions.permission")
      .findMany({
        where: { role: publicRole.id, enabled: true },
        limit: 100,
      });

    const appPerms = allPermissions.filter((p) => p.action.startsWith("api::"));
    console.log(`✅ Total enabled permissions: ${appPerms.length}`);
    appPerms.forEach((p) => console.log(`   - ${p.action}`));

    console.log("\n🎉 Setup complete!");
    console.log("\nTest these URLs:");
    console.log(
      "  - GET https://asociatia-zambete-magice.onrender.com/api/homepage?populate=*"
    );
    console.log(
      "  - GET https://asociatia-zambete-magice.onrender.com/api/campanie-de-donatiis?populate=coverImage"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await instance.destroy();
    process.exit(0);
  }
}

setupPublicAccess();
