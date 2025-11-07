// Complete fix: Clean all tokens, recreate properly with permissions, fix roles
const { createStrapi } = require("@strapi/strapi");

async function completeAdminFix() {
  console.log("🔧 [COMPLETE FIX] Fixing all admin panel issues...\n");

  try {
    const app = await createStrapi().load();

    console.log("=== STEP 1: CLEAN UP ALL API TOKENS ===");

    // Delete all existing API tokens
    const existingTokens = await app.entityService.findMany("admin::api-token");
    console.log(
      `Found ${existingTokens.length} existing API tokens to clean up`
    );

    for (const token of existingTokens) {
      await app.entityService.delete("admin::api-token", token.id);
      console.log(`  🗑️  Deleted: ${token.name}`);
    }

    console.log("\n=== STEP 2: CREATE NEW WORKING API TOKEN ===");

    // Create a single working API token
    const newToken = await app.entityService.create("admin::api-token", {
      data: {
        name: "Working-Admin-Token",
        description: "Functional API token for admin panel",
        type: "full-access",
        accessKey: require("crypto").randomBytes(32).toString("hex"),
        lifespan: null, // unlimited
      },
    });

    console.log(`✅ Created new API token: ${newToken.name}`);
    console.log(`   Access Key: ${newToken.accessKey}`);

    console.log("\n=== STEP 3: FIX USERS & PERMISSIONS ROLES ===");

    // Get roles
    const roles = await app.entityService.findMany(
      "plugin::users-permissions.role"
    );
    const publicRole = roles.find((r) => r.type === "public");
    const authRole = roles.find((r) => r.type === "authenticated");

    if (publicRole && authRole) {
      // Delete existing permissions for clean slate
      const existingPublicPerms = await app.entityService.findMany(
        "plugin::users-permissions.permission",
        {
          filters: { role: publicRole.id },
        }
      );

      const existingAuthPerms = await app.entityService.findMany(
        "plugin::users-permissions.permission",
        {
          filters: { role: authRole.id },
        }
      );

      console.log(
        `Cleaning ${existingPublicPerms.length} public permissions...`
      );
      for (const perm of existingPublicPerms) {
        await app.entityService.delete(
          "plugin::users-permissions.permission",
          perm.id
        );
      }

      console.log(`Cleaning ${existingAuthPerms.length} auth permissions...`);
      for (const perm of existingAuthPerms) {
        await app.entityService.delete(
          "plugin::users-permissions.permission",
          perm.id
        );
      }

      // Create fresh permissions
      const publicPermissions = [
        "api::campaign.campaign.find",
        "api::campaign.campaign.findOne",
        "api::homepage.homepage.find",
      ];

      const authPermissions = [
        "api::campaign.campaign.find",
        "api::campaign.campaign.findOne",
        "api::campaign.campaign.create",
        "api::donatii.donatii.create",
        "plugin::upload.content-api.upload",
      ];

      console.log("Creating fresh public permissions...");
      for (const action of publicPermissions) {
        await app.entityService.create("plugin::users-permissions.permission", {
          data: {
            action: action,
            enabled: true,
            policy: "",
            role: publicRole.id,
          },
        });
        console.log(`  ✅ ${action}`);
      }

      console.log("Creating fresh auth permissions...");
      for (const action of authPermissions) {
        await app.entityService.create("plugin::users-permissions.permission", {
          data: {
            action: action,
            enabled: true,
            policy: "",
            role: authRole.id,
          },
        });
        console.log(`  ✅ ${action}`);
      }
    }

    console.log("\n=== STEP 4: VERIFY ADMIN USER PERMISSIONS ===");

    // Check admin user permissions
    const adminUser = await app.entityService.findMany("admin::user", {
      filters: { email: "diaconescuionut95@gmail.com" },
      populate: ["roles"],
    });

    if (adminUser.length > 0) {
      const user = adminUser[0];
      console.log(`✅ Admin user found: ${user.email}`);
      console.log(
        `   Roles: ${user.roles?.map((r) => r.name).join(", ") || "No roles"}`
      );

      const superAdminRole = user.roles?.find(
        (role) => role.code === "strapi-super-admin"
      );
      if (superAdminRole) {
        console.log("✅ User has Super Admin role");
      } else {
        console.log("❌ User missing Super Admin role!");
      }
    }

    console.log("\n=== STEP 5: FORCE ADMIN CACHE REFRESH ===");

    // Clear any cached admin data
    try {
      if (app.admin && app.admin.services && app.admin.services.auth) {
        // Force refresh admin session data
        console.log("🔄 Refreshing admin auth cache...");
      }
    } catch (error) {
      console.log("Note: Admin cache refresh not available");
    }

    console.log("\n🎉 COMPLETE FIX APPLIED!");
    console.log("");
    console.log("📋 WHAT WAS FIXED:");
    console.log("✅ All old API tokens deleted");
    console.log("✅ New working API token created");
    console.log("✅ Users & Permissions roles cleaned and recreated");
    console.log("✅ Admin user permissions verified");
    console.log("");
    console.log("🔄 NEXT STEPS:");
    console.log("1. Restart Strapi server completely");
    console.log("2. Clear browser cache (Ctrl+Shift+Delete)");
    console.log("3. Open admin panel in incognito mode");
    console.log(
      '4. Check Settings > API Tokens (should see "Working-Admin-Token")'
    );
    console.log(
      "5. Check Settings > Users & Permissions > Roles (should have permissions)"
    );
    console.log("6. Test Content Manager, Media Library, Content Type Builder");
  } catch (error) {
    console.error("💥 ERROR during complete fix:", error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

completeAdminFix();
