// Ultimate verification script - Check EVERYTHING needed for Strapi admin to work
const { createStrapi } = require("@strapi/strapi");

async function ultimateVerification() {
  console.log(
    "🔍 [ULTIMATE VERIFICATION] Checking ALL Strapi configurations...\n"
  );

  try {
    const app = await createStrapi().load();

    let issuesFound = 0;
    const recommendations = [];

    console.log("=== 🔐 1. ENVIRONMENT VARIABLES CHECK ===");
    const requiredEnvVars = [
      "ADMIN_JWT_SECRET",
      "API_TOKEN_SALT",
      "TRANSFER_TOKEN_SALT",
      "ENCRYPTION_KEY",
      "APP_KEYS",
      "DATABASE_HOST",
      "DATABASE_PORT",
      "DATABASE_NAME",
      "DATABASE_USERNAME",
      "DATABASE_PASSWORD",
    ];

    requiredEnvVars.forEach((envVar) => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.log(`❌ ${envVar}: MISSING!`);
        issuesFound++;
        recommendations.push(`Add ${envVar} to environment variables`);
      }
    });

    console.log("\n=== 🏗️ 2. DATABASE CONNECTION CHECK ===");
    try {
      const dbTest = await app.db.connection.raw("SELECT 1 as test");
      console.log("✅ Database connection: Working");
      console.log(
        `   Database type: ${app.db.connection.client.config.client}`
      );
    } catch (error) {
      console.log("❌ Database connection: FAILED");
      console.log(`   Error: ${error.message}`);
      issuesFound++;
      recommendations.push("Check database connection settings");
    }

    console.log("\n=== 👤 3. ADMIN USER CHECK ===");
    const adminUsers = await app.entityService.findMany("admin::user", {
      populate: ["roles"],
    });

    const superAdmins = adminUsers.filter((user) =>
      user.roles?.some((role) => role.code === "strapi-super-admin")
    );

    if (superAdmins.length > 0) {
      console.log(`✅ Super Admin users: ${superAdmins.length} found`);
      superAdmins.forEach((admin) => {
        console.log(`   - ${admin.email} (active: ${admin.isActive})`);
      });
    } else {
      console.log("❌ Super Admin users: NONE FOUND!");
      issuesFound++;
      recommendations.push("Create a Super Admin user");
    }

    console.log("\n=== 🔑 4. API TOKENS CHECK ===");
    const apiTokens = await app.entityService.findMany("admin::api-token", {
      populate: ["permissions"],
    });

    if (apiTokens.length > 0) {
      console.log(`✅ API Tokens: ${apiTokens.length} found`);
      const fullAccessTokens = apiTokens.filter(
        (token) => token.type === "full-access"
      );
      console.log(`   Full-access tokens: ${fullAccessTokens.length}`);

      if (fullAccessTokens.length === 0) {
        console.log("❌ No full-access API tokens found");
        issuesFound++;
        recommendations.push("Create a full-access API token");
      }
    } else {
      console.log("❌ API Tokens: NONE FOUND!");
      issuesFound++;
      recommendations.push("Create API tokens");
    }

    console.log("\n=== 🎭 5. ADMIN ROLES & PERMISSIONS CHECK ===");
    const adminRoles = await app.entityService.findMany("admin::role", {
      populate: ["permissions"],
    });

    adminRoles.forEach((role) => {
      console.log(`Role: ${role.name} (${role.code})`);
      console.log(`   Permissions: ${role.permissions?.length || 0}`);

      if (role.code === "strapi-super-admin" && role.permissions?.length < 90) {
        console.log("❌ Super Admin role has insufficient permissions!");
        issuesFound++;
        recommendations.push("Repair Super Admin role permissions");
      }
    });

    console.log("\n=== 👥 6. USERS & PERMISSIONS PLUGIN CHECK ===");
    const upRoles = await app.entityService.findMany(
      "plugin::users-permissions.role",
      {
        populate: ["permissions", "users"],
      }
    );

    const publicRole = upRoles.find((r) => r.type === "public");
    const authRole = upRoles.find((r) => r.type === "authenticated");

    if (publicRole) {
      console.log(
        `✅ Public role: ${publicRole.permissions?.length || 0} permissions`
      );
      if (!publicRole.permissions || publicRole.permissions.length === 0) {
        console.log("❌ Public role has no permissions");
        issuesFound++;
        recommendations.push("Configure Public role permissions");
      }
    } else {
      console.log("❌ Public role: NOT FOUND!");
      issuesFound++;
      recommendations.push("Create Public role");
    }

    if (authRole) {
      console.log(
        `✅ Authenticated role: ${authRole.permissions?.length || 0} permissions`
      );
      if (!authRole.permissions || authRole.permissions.length === 0) {
        console.log("❌ Authenticated role has no permissions");
        issuesFound++;
        recommendations.push("Configure Authenticated role permissions");
      }
    } else {
      console.log("❌ Authenticated role: NOT FOUND!");
      issuesFound++;
      recommendations.push("Create Authenticated role");
    }

    console.log("\n=== 🧩 7. PLUGINS CHECK ===");
    const corePlugins = [
      "content-manager",
      "content-type-builder",
      "upload",
      "users-permissions",
    ];
    corePlugins.forEach((pluginName) => {
      const plugin = app.plugin(pluginName);
      if (plugin) {
        console.log(`✅ ${pluginName}: Loaded`);
        console.log(
          `   Services: ${Object.keys(plugin.services || {}).length}`
        );
        console.log(
          `   Controllers: ${Object.keys(plugin.controllers || {}).length}`
        );
      } else {
        console.log(`❌ ${pluginName}: NOT LOADED!`);
        issuesFound++;
        recommendations.push(`Check ${pluginName} plugin installation`);
      }
    });

    console.log("\n=== 📄 8. CONTENT TYPES CHECK ===");
    const contentTypes = Object.keys(app.contentTypes).filter((uid) =>
      uid.startsWith("api::")
    );
    console.log(`✅ API Content Types: ${contentTypes.length} found`);
    contentTypes.forEach((uid) => {
      console.log(`   - ${uid}`);
    });

    console.log("\n=== 🔧 9. MIDDLEWARE CHECK ===");
    try {
      const middlewareConfig = require("../config/middlewares.js");
      console.log("✅ Middlewares config: Found");

      // Check if it's a function (recommended)
      if (typeof middlewareConfig === "function") {
        console.log("✅ Middlewares: Function-based (correct)");
      } else {
        console.log("⚠️ Middlewares: Array-based (consider function-based)");
      }
    } catch (error) {
      console.log("❌ Middlewares config: ERROR");
      issuesFound++;
      recommendations.push("Check middlewares configuration");
    }

    console.log("\n=== 🌐 10. SERVER CONFIG CHECK ===");
    try {
      const serverConfig = require("../config/server.js");
      console.log("✅ Server config: Found");
    } catch (error) {
      console.log("❌ Server config: ERROR");
      issuesFound++;
      recommendations.push("Check server configuration");
    }

    // FINAL SUMMARY
    console.log("\n" + "=".repeat(60));
    console.log("🎯 VERIFICATION SUMMARY");
    console.log("=".repeat(60));

    if (issuesFound === 0) {
      console.log("🎉 ALL CHECKS PASSED! Your Strapi should work perfectly.");
    } else {
      console.log(`❌ ${issuesFound} ISSUES FOUND!`);
      console.log("\n🔧 RECOMMENDATIONS:");
      recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    console.log("\n📋 MANUAL SETTINGS CHECKLIST:");
    console.log("After deploy, manually check in Strapi Admin:");
    console.log("");
    console.log("1. 🔑 Settings > API Tokens:");
    console.log("   - Should have at least 1 full-access token");
    console.log("   - Token should be enabled and not expired");
    console.log("");
    console.log("2. 👥 Settings > Administration Panel > Users:");
    console.log("   - Your admin user should exist");
    console.log('   - Should have "Super Admin" role');
    console.log("   - Should be active");
    console.log("");
    console.log("3. 🎭 Settings > Administration Panel > Roles:");
    console.log("   - Super Admin should have ALL permissions checked");
    console.log("   - Editor/Author roles should have appropriate permissions");
    console.log("");
    console.log("4. 🔐 Settings > Users & Permissions Plugin > Roles:");
    console.log("   - Public role: find/findOne for public content");
    console.log("   - Authenticated role: create permissions for user actions");
    console.log("");
    console.log("5. 🧩 Test Core Functionality:");
    console.log("   - Content Manager should load without infinite spinning");
    console.log(
      '   - Media Library should work without "p is not a function" error'
    );
    console.log(
      "   - Content Type Builder should load without undefined errors"
    );
  } catch (error) {
    console.error("💥 VERIFICATION ERROR:", error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

ultimateVerification();
