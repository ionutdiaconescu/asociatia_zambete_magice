// Script pentru recompilarea și repararea admin panel build-ului
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("[rebuild-admin] Starting admin panel rebuild...");

try {
  // 1. Șterge cache-urile existente
  console.log("1. Clearing admin build cache...");

  const buildPath = path.join(__dirname, "..", "dist", "build");
  const cachePath = path.join(__dirname, "..", ".cache");
  const nodeModulesAdminPath = path.join(
    __dirname,
    "..",
    "node_modules",
    "@strapi",
    "admin",
    "dist"
  );

  // Șterge build existent
  if (fs.existsSync(buildPath)) {
    fs.rmSync(buildPath, { recursive: true, force: true });
    console.log("   ✅ Deleted dist/build");
  }

  // Șterge cache
  if (fs.existsSync(cachePath)) {
    fs.rmSync(cachePath, { recursive: true, force: true });
    console.log("   ✅ Deleted .cache");
  }

  // 2. Recompilează admin panel cu flag-uri specifice
  console.log("\n2. Rebuilding admin panel...");

  try {
    execSync("npm run build", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
      env: {
        ...process.env,
        NODE_ENV: "production",
        STRAPI_TELEMETRY_DISABLED: "true",
      },
    });
    console.log("   ✅ Build completed successfully");
  } catch (buildError) {
    console.error("   ❌ Build failed:", buildError.message);
    throw buildError;
  }

  // 3. Verifică că build-ul s-a creat corect
  console.log("\n3. Verifying build...");

  const indexPath = path.join(buildPath, "index.html");
  const jsFiles = fs.readdirSync(buildPath).filter((f) => f.endsWith(".js"));

  if (fs.existsSync(indexPath)) {
    console.log("   ✅ index.html exists");
  } else {
    throw new Error("index.html missing from build");
  }

  if (jsFiles.length > 0) {
    console.log(`   ✅ ${jsFiles.length} JS files generated`);
    jsFiles.slice(0, 3).forEach((f) => console.log(`      - ${f}`));
  } else {
    throw new Error("No JS files found in build");
  }

  // 4. Verifică mărimea fișierelor
  const buildStats = fs.statSync(indexPath);
  console.log(`   ℹ️  index.html size: ${buildStats.size} bytes`);

  if (buildStats.size < 1000) {
    console.warn("   ⚠️  index.html seems too small, might be corrupted");
  }

  console.log("\n🎉 Admin panel rebuild completed successfully!");
  console.log("Deploy the application to test the fix.");
} catch (error) {
  console.error("\n❌ Rebuild failed:", error.message);
  console.error(error.stack);
  process.exit(1);
}
