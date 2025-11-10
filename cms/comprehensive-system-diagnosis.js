// COMPREHENSIVE STRAPI SYSTEM DIAGNOSIS - Check everything related to admin corruption
const { createStrapi } = require("@strapi/strapi");

async function comprehensiveSystemDiagnosis() {
  console.log("🔍 COMPREHENSIVE STRAPI SYSTEM DIAGNOSIS");
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log(`Started at: ${new Date().toISOString()}\n`);

  try {
    const app = await createStrapi().load();
    let criticalIssues = 0;
    let warningsFound = 0;
    let recommendations = [];

    // ==========================================
    // 1. MULTIPLE ADMIN USERS CONFLICT CHECK
    // ==========================================
    console.log("🚨 1. MULTIPLE ADMIN USERS CONFLICT CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const allAdminUsers = await app.entityService.findMany("admin::user", {
      populate: ["roles"],
    });

    console.log(`📊 Total Admin Users: ${allAdminUsers.length}`);

    const suspectedEmails = [
      "ionutdiaconescu95@yahoo.com",
      "diaconescuionut95@gmail.com",
    ];

    const foundUsers = [];
    for (const email of suspectedEmails) {
      const user = allAdminUsers.find((u) => u.email === email);
      if (user) {
        foundUsers.push(user);
        console.log(`\n👤 Found User: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.firstname} ${user.lastname}`);
        console.log(`   Active: ${user.isActive ? "✅ YES" : "❌ NO"}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Roles: ${user.roles?.length || 0}`);

        if (user.roles?.length > 0) {
          user.roles.forEach((role) => {
            console.log(`     - ${role.name} (${role.code})`);
          });
        }
      }
    }

    if (foundUsers.length > 1) {
      console.log("\n🚨 CRITICAL: Multiple admin users detected!");
      console.log("   This can cause role conflicts and permission issues.");
      criticalIssues++;
      recommendations.push(
        "Remove duplicate admin user or merge roles properly"
      );
    } else if (foundUsers.length === 1) {
      console.log("\n✅ Good: Single admin user detected");
    } else {
      console.log("\n❌ CRITICAL: No expected admin users found!");
      criticalIssues++;
      recommendations.push("Create proper admin user");
    }

    // ==========================================
    // 2. API TOKENS INTEGRITY CHECK
    // ==========================================
    console.log("\n\n🔑 2. API TOKENS INTEGRITY CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const apiTokens = await app.entityService.findMany("admin::api-token", {
      populate: "*",
    });

    console.log(`📊 Total API Tokens: ${apiTokens.length}`);

    if (apiTokens.length === 0) {
      console.log("❌ CRITICAL: No API tokens found!");
      criticalIssues++;
      recommendations.push("Create at least one full-access API token");
    } else {
      let workingTokens = 0;

      apiTokens.forEach((token, index) => {
        console.log(`\n🔑 Token ${index + 1}: ${token.name}`);
        console.log(`   ID: ${token.id}`);
        console.log(`   Type: ${token.type}`);
        console.log(
          `   Access Key: ${token.accessKey ? token.accessKey.substring(0, 20) + "..." : "❌ MISSING"}`
        );
        console.log(`   Lifespan: ${token.lifespan || "Unlimited"}`);
        console.log(`   Last Used: ${token.lastUsedAt || "Never"}`);
        console.log(`   Created: ${token.createdAt}`);

        if (token.accessKey && token.type === "full-access") {
          workingTokens++;
        }
      });

      if (workingTokens === 0) {
        console.log("\n❌ CRITICAL: No working full-access tokens!");
        criticalIssues++;
        recommendations.push("Recreate API tokens with full access");
      } else {
        console.log(`\n✅ Found ${workingTokens} working tokens`);
      }
    }

    // ==========================================
    // 3. ADMIN ROLES & PERMISSIONS CHECK
    // ==========================================
    console.log("\n\n🎭 3. ADMIN ROLES & PERMISSIONS DEEP CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const adminRoles = await app.entityService.findMany("admin::role", {
      populate: ["permissions", "users"],
    });

    console.log(`📊 Total Admin Roles: ${adminRoles.length}`);

    let superAdminRole = null;

    for (const role of adminRoles) {
      console.log(`\n🎭 Role: ${role.name} (${role.code})`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Description: ${role.description || "No description"}`);
      console.log(`   Users Count: ${role.users?.length || 0}`);
      console.log(`   Permissions Count: ${role.permissions?.length || 0}`);

      if (role.code === "strapi-super-admin") {
        superAdminRole = role;

        if (role.permissions?.length < 90) {
          console.log(
            "   ❌ CRITICAL: Insufficient permissions for Super Admin!"
          );
          criticalIssues++;
          recommendations.push("Restore Super Admin permissions");
        } else {
          console.log("   ✅ Super Admin permissions look good");
        }

        if (role.users?.length === 0) {
          console.log("   ❌ CRITICAL: No users assigned to Super Admin role!");
          criticalIssues++;
          recommendations.push("Assign user to Super Admin role");
        }
      }
    }

    if (!superAdminRole) {
      console.log("\n❌ CRITICAL: Super Admin role not found!");
      criticalIssues++;
      recommendations.push("Recreate Super Admin role");
    }

    // ==========================================
    // 4. USERS & PERMISSIONS PLUGIN CHECK
    // ==========================================
    console.log("\n\n👥 4. USERS & PERMISSIONS PLUGIN CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const upRoles = await app.entityService.findMany(
      "plugin::users-permissions.role"
    );
    const upPermissions = await app.entityService.findMany(
      "plugin::users-permissions.permission"
    );

    console.log(`📊 U&P Roles: ${upRoles.length}`);
    console.log(`📊 U&P Permissions: ${upPermissions.length}`);

    const publicRole = upRoles.find((r) => r.type === "public");
    const authRole = upRoles.find((r) => r.type === "authenticated");

    if (!publicRole || !authRole) {
      console.log("❌ CRITICAL: Missing basic Users & Permissions roles!");
      criticalIssues++;
      recommendations.push("Recreate Users & Permissions basic roles");
    } else {
      console.log("✅ Basic Users & Permissions roles exist");

      // Check public permissions
      const publicPerms = upPermissions.filter((p) => p.role === publicRole.id);
      console.log(`   Public role permissions: ${publicPerms.length}`);

      if (publicPerms.length === 0) {
        console.log("   ⚠️  WARNING: Public role has no permissions");
        warningsFound++;
        recommendations.push("Add basic public permissions for API access");
      }
    }

    // ==========================================
    // 5. DATABASE CONTENT TYPES CHECK
    // ==========================================
    console.log("\n\n🗃️ 5. DATABASE CONTENT TYPES CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const contentTypes = Object.keys(app.contentTypes);
    console.log(`📊 Total Content Types: ${contentTypes.length}`);

    const expectedTypes = [
      "api::campaign.campaign",
      "api::donatii.donatii",
      "api::homepage.homepage",
    ];

    for (const expectedType of expectedTypes) {
      if (contentTypes.includes(expectedType)) {
        console.log(`✅ ${expectedType}: Found`);
      } else {
        console.log(`❌ ${expectedType}: Missing`);
        warningsFound++;
        recommendations.push(`Check ${expectedType} content type`);
      }
    }

    // ==========================================
    // 6. MEDIA LIBRARY & UPLOAD CHECK
    // ==========================================
    console.log("\n\n📸 6. MEDIA LIBRARY & UPLOAD CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      const uploadFiles = await app.entityService.findMany(
        "plugin::upload.file",
        {
          limit: 5,
        }
      );
      console.log(`📊 Upload Files: ${uploadFiles.length} (showing max 5)`);

      if (uploadFiles.length > 0) {
        console.log("✅ Media Library has content");
        uploadFiles.forEach((file, index) => {
          console.log(`   File ${index + 1}: ${file.name} (${file.mime})`);
        });
      } else {
        console.log("⚠️  Media Library is empty");
      }
    } catch (error) {
      console.log("❌ CRITICAL: Cannot access Media Library!");
      console.log(`   Error: ${error.message}`);
      criticalIssues++;
      recommendations.push("Fix Media Library access permissions");
    }

    // ==========================================
    // 7. ENVIRONMENT & CONFIGURATION CHECK
    // ==========================================
    console.log("\n\n⚙️ 7. ENVIRONMENT & CONFIGURATION CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const requiredEnvVars = [
      "ADMIN_JWT_SECRET",
      "API_TOKEN_SALT",
      "TRANSFER_TOKEN_SALT",
      "DATABASE_HOST",
      "DATABASE_PORT",
      "DATABASE_NAME",
      "DATABASE_USERNAME",
      "DATABASE_PASSWORD",
    ];

    let missingEnvVars = 0;

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.log(`❌ ${envVar}: Missing`);
        missingEnvVars++;
      }
    }

    if (missingEnvVars > 0) {
      console.log(
        `\n❌ CRITICAL: ${missingEnvVars} environment variables missing!`
      );
      criticalIssues++;
      recommendations.push("Set all required environment variables");
    }

    // ==========================================
    // 8. EMERGENCY DIAGNOSTIC TEST
    // ==========================================
    console.log("\n\n🚨 8. EMERGENCY DIAGNOSTIC TEST");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Test creating a token
    try {
      const testToken = await app.entityService.create("admin::api-token", {
        data: {
          name: `Diagnostic-Test-${Date.now()}`,
          description: "Test token for diagnosis",
          type: "full-access",
          accessKey: require("crypto").randomBytes(32).toString("hex"),
          lifespan: null,
        },
      });

      console.log("✅ Token creation test: SUCCESS");
      console.log(`   Test token created with ID: ${testToken.id}`);

      // Clean up test token
      await app.entityService.delete("admin::api-token", testToken.id);
      console.log("✅ Test token cleaned up");
    } catch (error) {
      console.log("❌ CRITICAL: Token creation test FAILED!");
      console.log(`   Error: ${error.message}`);
      criticalIssues++;
      recommendations.push("Fix token creation mechanism");
    }

    // ==========================================
    // FINAL DIAGNOSIS REPORT
    // ==========================================
    console.log("\n\n" + "═".repeat(65));
    console.log("📋 FINAL DIAGNOSIS REPORT");
    console.log("═".repeat(65));

    console.log(`\n🎯 SYSTEM HEALTH SUMMARY:`);
    console.log(`   🚨 Critical Issues: ${criticalIssues}`);
    console.log(`   ⚠️  Warnings: ${warningsFound}`);
    console.log(`   📊 Admin Users: ${allAdminUsers.length}`);
    console.log(`   🔑 API Tokens: ${apiTokens.length}`);
    console.log(`   🎭 Admin Roles: ${adminRoles.length}`);
    console.log(`   📁 Content Types: ${contentTypes.length}`);

    if (criticalIssues === 0) {
      console.log(`\n🎉 EXCELLENT: No critical issues found!`);
    } else if (criticalIssues <= 2) {
      console.log(
        `\n⚠️  MODERATE: ${criticalIssues} critical issues need attention`
      );
    } else {
      console.log(
        `\n🚨 SEVERE: ${criticalIssues} critical issues require immediate fix!`
      );
    }

    if (recommendations.length > 0) {
      console.log(`\n🔧 RECOMMENDATIONS:`);
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    // Specific corruption detection
    if (foundUsers.length > 1) {
      console.log(`\n🎯 SPECIFIC CORRUPTION DETECTED:`);
      console.log(
        `   Multiple admin users (${foundUsers.map((u) => u.email).join(", ")})`
      );
      console.log(`   This explains role conflicts and permission issues!`);
      console.log(`\n💡 SOLUTION NEEDED:`);
      console.log(`   1. Backup current system state`);
      console.log(`   2. Remove duplicate admin user`);
      console.log(`   3. Ensure remaining user has Super Admin role`);
      console.log(`   4. Regenerate all API tokens`);
      console.log(`   5. Clear admin panel cache`);
    }

    console.log(`\n⏰ Diagnosis completed at: ${new Date().toISOString()}`);

    await app.destroy();
    return {
      criticalIssues,
      warningsFound,
      recommendations,
      multipleAdmins: foundUsers.length > 1,
      adminUsers: foundUsers,
    };
  } catch (error) {
    console.error("\n💥 DIAGNOSIS FAILED:", error.message);
    console.error("Stack trace:", error.stack);
    return { error: error.message };
  }
}

// Run diagnosis
if (require.main === module) {
  comprehensiveSystemDiagnosis();
}

module.exports = comprehensiveSystemDiagnosis;
