// Production fix script that runs on server startup
const { createStrapi } = require("@strapi/strapi");

async function productionAdminFix() {
  console.log("🔧 [PRODUCTION FIX] Running admin fix on server startup...\n");

  try {
    // Only run this fix once per deploy
    const fixMarkerFile = "/tmp/admin-fix-applied.marker";
    const fs = require("fs");

    if (fs.existsSync(fixMarkerFile)) {
      console.log("✅ Admin fix already applied in this deployment");
      return;
    }

    const app = await createStrapi().load();

    console.log("=== PRODUCTION: ENSURE API TOKEN EXISTS ===");

    // Check if we have any API tokens
    const existingTokens = await app.entityService.findMany("admin::api-token");
    console.log(`Found ${existingTokens.length} existing API tokens`);

    const workingToken = existingTokens.find(
      (token) =>
        token.name === "Working-Admin-Token" && token.type === "full-access"
    );

    if (!workingToken) {
      console.log("Creating production API token...");

      const newToken = await app.entityService.create("admin::api-token", {
        data: {
          name: "Production-Admin-Token",
          description: "Production API token for admin panel functionality",
          type: "full-access",
          accessKey: require("crypto").randomBytes(32).toString("hex"),
          lifespan: null, // unlimited
        },
      });

      console.log(`✅ Created production API token: ${newToken.name}`);
      console.log(`   Access Key: ${newToken.accessKey.substring(0, 20)}...`);
    } else {
      console.log(`✅ Working API token already exists: ${workingToken.name}`);
    }

    console.log("\n=== PRODUCTION: ENSURE USERS & PERMISSIONS SETUP ===");

    // Ensure Users & Permissions roles have basic permissions
    const roles = await app.entityService.findMany(
      "plugin::users-permissions.role"
    );
    const publicRole = roles.find((r) => r.type === "public");
    const authRole = roles.find((r) => r.type === "authenticated");

    if (publicRole) {
      const publicPerms = await app.entityService.findMany(
        "plugin::users-permissions.permission",
        {
          filters: { role: publicRole.id },
        }
      );

      if (publicPerms.length === 0) {
        console.log("Adding basic public permissions...");

        const basicPublicPerms = [
          "api::campaign.campaign.find",
          "api::campaign.campaign.findOne",
          "api::homepage.homepage.find",
        ];

        for (const action of basicPublicPerms) {
          try {
            await app.entityService.create(
              "plugin::users-permissions.permission",
              {
                data: {
                  action: action,
                  enabled: true,
                  policy: "",
                  role: publicRole.id,
                },
              }
            );
            console.log(`  ✅ ${action}`);
          } catch (error) {
            console.log(`  ⚠️  ${action} - ${error.message}`);
          }
        }
      }
    }

    console.log("\n=== PRODUCTION: VERIFY ADMIN USER ===");

    // Ensure admin user exists and has correct role
    const adminUsers = await app.entityService.findMany("admin::user", {
      filters: { email: "diaconescuionut95@gmail.com" },
      populate: ["roles"],
    });

    if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      console.log(`✅ Admin user exists: ${admin.email}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Roles: ${admin.roles?.map((r) => r.name).join(", ")}`);

      const hasSuperAdmin = admin.roles?.some(
        (role) => role.code === "strapi-super-admin"
      );
      if (!hasSuperAdmin) {
        console.log("❌ Admin user missing Super Admin role!");

        // Find Super Admin role
        const superAdminRole = await app.entityService.findMany("admin::role", {
          filters: { code: "strapi-super-admin" },
        });

        if (superAdminRole.length > 0) {
          // Add Super Admin role to user
          await app.entityService.update("admin::user", admin.id, {
            data: {
              roles: [
                ...(admin.roles?.map((r) => r.id) || []),
                superAdminRole[0].id,
              ],
            },
          });
          console.log("✅ Added Super Admin role to user");
        }
      }
    }

    // Mark fix as applied
    fs.writeFileSync(fixMarkerFile, new Date().toISOString());
    console.log("\n🎉 PRODUCTION ADMIN FIX COMPLETED!");
  } catch (error) {
    console.error("💥 PRODUCTION FIX ERROR:", error.message);
  }
}

// Export for use in bootstrap
module.exports = productionAdminFix;

// If run directly, execute the fix
if (require.main === module) {
  productionAdminFix().then(() => process.exit(0));
}
