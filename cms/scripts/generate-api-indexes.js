/**
 * Auto-generate missing index.ts files for API modules
 * Run after creating content types in Admin UI: node scripts/generate-api-indexes.js
 */

const fs = require("fs");
const path = require("path");

const apiDir = path.join(__dirname, "../src/api");

function generateIndexForApi(apiName) {
  const apiPath = path.join(apiDir, apiName);
  const indexPath = path.join(apiPath, "index.ts");

  // Check if index.ts already exists
  if (fs.existsSync(indexPath)) {
    console.log(`⏭️  ${apiName}/index.ts already exists`);
    return false;
  }

  // Check if required folders exist
  const hasControllers = fs.existsSync(path.join(apiPath, "controllers"));
  const hasServices = fs.existsSync(path.join(apiPath, "services"));
  const hasRoutes = fs.existsSync(path.join(apiPath, "routes"));

  if (!hasControllers || !hasServices || !hasRoutes) {
    console.log(`⚠️  ${apiName} - missing required folders, skipping`);
    return false;
  }

  // Generate index.ts content
  const content = `import controller from './controllers/${apiName}';
import service from './services/${apiName}';
import routes from './routes/${apiName}';

export default {
  controller,
  service,
  routes,
};
`;

  fs.writeFileSync(indexPath, content, "utf8");
  console.log(`✅ Generated ${apiName}/index.ts`);
  return true;
}

function main() {
  console.log("🔍 Scanning API modules...\n");

  if (!fs.existsSync(apiDir)) {
    console.error("❌ API directory not found:", apiDir);
    process.exit(1);
  }

  const entries = fs.readdirSync(apiDir, { withFileTypes: true });
  const apiModules = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name);

  console.log(`Found ${apiModules.length} API modules:`, apiModules.join(", "));
  console.log();

  let generated = 0;
  for (const apiName of apiModules) {
    if (generateIndexForApi(apiName)) {
      generated++;
    }
  }

  console.log(`\n🎉 Done! Generated ${generated} index.ts file(s)`);

  if (generated > 0) {
    console.log("\n💡 Next steps:");
    console.log("   1. Review generated files");
    console.log("   2. Run: npm run build");
    console.log("   3. Commit and push changes");
  }
}

main();
