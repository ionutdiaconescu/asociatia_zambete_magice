// Fix public permissions for API access
const { createStrapi } = require("@strapi/strapi");

async function fixPublicPermissions() {
  console.log("🔧 FIXING PUBLIC PERMISSIONS FOR API ACCESS\n");

  try {
    const app = await createStrapi().load();

    // Get public role
    const roles = await app.entityService.findMany(
      "plugin::users-permissions.role"
    );
    const publicRole = roles.find((r) => r.type === "public");

    if (!publicRole) {
      console.log("❌ Public role not found!");
      return;
    }

    console.log(
      `✅ Found public role: ${publicRole.name} (ID: ${publicRole.id})`
    );

    // Delete existing public permissions for clean slate
    const existingPerms = await app.entityService.findMany(
      "plugin::users-permissions.permission",
      {
        filters: { role: publicRole.id },
      }
    );

    console.log(`🗑️ Cleaning ${existingPerms.length} existing permissions...`);
    for (const perm of existingPerms) {
      await app.entityService.delete(
        "plugin::users-permissions.permission",
        perm.id
      );
    }

    // Add essential public permissions
    const publicPermissions = [
      "api::campaign.campaign.find",
      "api::campaign.campaign.findOne",
      "api::donatii.donatii.find",
      "api::donatii.donatii.findOne",
      "api::donatii.donatii.create", // For donations
      "api::homepage.homepage.find",
      "api::homepage.homepage.findOne",
    ];

    console.log("📝 Adding essential public permissions...");
    for (const action of publicPermissions) {
      try {
        await app.entityService.create("plugin::users-permissions.permission", {
          data: {
            action: action,
            enabled: true,
            policy: "",
            role: publicRole.id,
          },
        });
        console.log(`  ✅ ${action}`);
      } catch (error) {
        console.log(`  ⚠️ ${action} - ${error.message}`);
      }
    }

    // Verify permissions were added
    const newPerms = await app.entityService.findMany(
      "plugin::users-permissions.permission",
      {
        filters: { role: publicRole.id },
      }
    );

    console.log(`\n✅ PUBLIC PERMISSIONS FIXED!`);
    console.log(`   Total permissions added: ${newPerms.length}`);
    console.log(`\n🎯 PUBLIC API ENDPOINTS NOW ACCESSIBLE:`);
    publicPermissions.forEach((perm) => {
      console.log(`   - ${perm}`);
    });

    await app.destroy();
    console.log(`\n🎉 Fix completed successfully!`);
  } catch (error) {
    console.error("💥 Error fixing public permissions:", error.message);
  }
}

if (require.main === module) {
  fixPublicPermissions();
}

module.exports = fixPublicPermissions;
