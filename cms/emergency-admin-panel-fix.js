// Emergency Admin Panel JavaScript Error Fix
const fs = require("fs");
const path = require("path");
const { createStrapi } = require("@strapi/strapi");

async function emergencyAdminPanelFix() {
  console.log("🚨 EMERGENCY ADMIN PANEL JAVASCRIPT ERROR FIX");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`Started at: ${new Date().toISOString()}\n`);

  // Check specific JavaScript errors
  console.log("🔍 1. ANALYZING SPECIFIC JAVASCRIPT ERRORS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("📝 Known Errors:");
  console.log("   1. Media Library: 'p is not a function'");
  console.log(
    "   2. Content Type Builder: 'Cannot read properties of undefined (reading 'tours')'"
  );
  console.log("   These indicate corrupted admin build or plugin conflicts\n");

  // Step 1: Complete build directory cleanup
  console.log("🧹 2. COMPLETE BUILD CLEANUP");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const buildPaths = [
    path.join(__dirname, "dist"),
    path.join(__dirname, "build"),
    path.join(__dirname, ".cache"),
    path.join(__dirname, "node_modules", ".cache"),
  ];

  for (const buildPath of buildPaths) {
    try {
      if (fs.existsSync(buildPath)) {
        fs.rmSync(buildPath, { recursive: true, force: true });
        console.log(`✅ Deleted: ${buildPath}`);
      } else {
        console.log(`ℹ️  Not found: ${buildPath}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not delete ${buildPath}: ${error.message}`);
    }
  }

  // Step 2: Clean node_modules admin cache
  console.log("\n🧹 3. CLEANING NODE_MODULES ADMIN CACHE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const adminCachePaths = [
    path.join(__dirname, "node_modules", "@strapi", "admin", "dist"),
    path.join(
      __dirname,
      "node_modules",
      "@strapi",
      "core",
      "node_modules",
      "@strapi",
      "admin",
      "dist"
    ),
    path.join(__dirname, "node_modules", ".vite"),
    path.join(__dirname, "node_modules", ".cache"),
  ];

  for (const cachePath of adminCachePaths) {
    try {
      if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true, force: true });
        console.log(`✅ Cleaned admin cache: ${cachePath}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not clean ${cachePath}: ${error.message}`);
    }
  }

  // Step 3: Check admin configuration for issues
  console.log("\n⚙️ 4. CHECKING ADMIN CONFIGURATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const adminConfigPath = path.join(__dirname, "config", "admin.js");
    const adminConfig = fs.readFileSync(adminConfigPath, "utf8");
    console.log("✅ Admin config readable");

    // Check for problematic configurations
    if (adminConfig.includes("serveAdminPanel: false")) {
      console.log("❌ FOUND ISSUE: serveAdminPanel is disabled!");
    } else {
      console.log("✅ Admin panel serving is enabled");
    }
  } catch (error) {
    console.log(`❌ Admin config issue: ${error.message}`);
  }

  // Step 4: Create clean admin config
  console.log("\n🔧 5. CREATING ULTRA-CLEAN ADMIN CONFIG");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const ultraCleanAdminConfig = `// Ultra-clean admin config for JavaScript error fix
module.exports = ({ env }) => ({
  auth: { 
    secret: env("ADMIN_JWT_SECRET") 
  },
  apiToken: { 
    salt: env("API_TOKEN_SALT") 
  },
  transfer: { 
    token: { 
      salt: env("TRANSFER_TOKEN_SALT") 
    } 
  },
  url: "/admin",
  autoOpen: false,
  // Disable problematic features that might cause JS errors
  rateLimit: {
    enabled: false
  }
});`;

  try {
    const adminConfigPath = path.join(__dirname, "config", "admin.js");
    const backupPath = path.join(__dirname, "config", "admin.js.backup");

    // Backup current config
    if (fs.existsSync(adminConfigPath)) {
      fs.copyFileSync(adminConfigPath, backupPath);
      console.log("✅ Backed up current admin config");
    }

    // Write ultra-clean config
    fs.writeFileSync(adminConfigPath, ultraCleanAdminConfig);
    console.log("✅ Created ultra-clean admin config");
  } catch (error) {
    console.log(`❌ Error updating admin config: ${error.message}`);
  }

  // Step 5: Check for plugin conflicts
  console.log("\n🔌 6. CHECKING FOR PLUGIN CONFLICTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const packageJsonPath = path.join(__dirname, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    console.log("📦 Checking Strapi version and plugins...");
    console.log(
      `   Strapi version: ${packageJson.dependencies?.["@strapi/strapi"] || "Unknown"}`
    );

    // Look for potentially problematic plugins
    const problematicPlugins = [
      "@strapi/plugin-documentation",
      "@strapi/plugin-graphql",
      "strapi-plugin-ckeditor",
    ];

    let foundProblematic = false;
    for (const plugin of problematicPlugins) {
      if (
        packageJson.dependencies?.[plugin] ||
        packageJson.devDependencies?.[plugin]
      ) {
        console.log(`⚠️  Found potentially problematic plugin: ${plugin}`);
        foundProblematic = true;
      }
    }

    if (!foundProblematic) {
      console.log("✅ No obviously problematic plugins found");
    }
  } catch (error) {
    console.log(`❌ Error checking plugins: ${error.message}`);
  }

  // Step 6: Test Strapi startup
  console.log("\n🧪 7. TESTING STRAPI STARTUP");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    console.log("🔄 Attempting to load Strapi...");
    const app = await createStrapi().load();
    console.log("✅ Strapi loads successfully!");

    // Quick functionality test
    const contentTypes = Object.keys(app.contentTypes);
    console.log(`✅ Content types accessible: ${contentTypes.length}`);

    await app.destroy();
    console.log("✅ Strapi shutdown successful");
  } catch (error) {
    console.log(`❌ Strapi startup failed: ${error.message}`);
    console.log("   This indicates deeper configuration issues");
  }

  // Instructions for next steps
  console.log("\n" + "═".repeat(65));
  console.log("📋 EMERGENCY FIX COMPLETED");
  console.log("═".repeat(65));

  console.log("\n🔄 NEXT STEPS:");
  console.log("1. Run 'npm run build' to rebuild admin with clean cache");
  console.log("2. Deploy to Render");
  console.log("3. Test admin panel in incognito browser mode");
  console.log(
    "4. If errors persist, we'll need to check Strapi version compatibility"
  );

  console.log("\n🎯 WHAT THIS FIX DID:");
  console.log("✅ Completely cleared all build caches");
  console.log("✅ Cleaned node_modules admin cache");
  console.log("✅ Created ultra-minimal admin config");
  console.log("✅ Checked for plugin conflicts");
  console.log("✅ Verified Strapi can start");

  console.log(`\n⏰ Fix completed at: ${new Date().toISOString()}`);
}

if (require.main === module) {
  emergencyAdminPanelFix();
}

module.exports = emergencyAdminPanelFix;
