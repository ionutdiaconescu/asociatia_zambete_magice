const fs = require("fs");
const path = require("path");

// Copiază build-ul generat în locația unde Strapi îl caută în production
async function copyAdminBuild() {
  const sourcePath = path.join(__dirname, "..", "dist", "build");
  const targetPath = path.join(
    __dirname,
    "..",
    "node_modules",
    "@strapi",
    "core",
    "node_modules",
    "@strapi",
    "admin",
    "dist",
    "server",
    "server",
    "build"
  );

  console.log("[copy-admin-build] Source:", sourcePath);
  console.log("[copy-admin-build] Target:", targetPath);

  try {
    // Creează directorul target dacă nu există
    await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });

    // Verifică dacă source există
    if (!fs.existsSync(sourcePath)) {
      console.log(
        "[copy-admin-build] Source directory does not exist, skipping..."
      );
      return;
    }

    // Copiază recursiv
    await copyRecursive(sourcePath, targetPath);
    console.log("[copy-admin-build] Admin build copied successfully!");
  } catch (error) {
    console.error("[copy-admin-build] Error:", error.message);
    // Nu aruncă eroarea - continuă startup-ul chiar dacă copierea eșuează
  }
}

async function copyRecursive(src, dest) {
  const stats = await fs.promises.stat(src);

  if (stats.isDirectory()) {
    await fs.promises.mkdir(dest, { recursive: true });
    const entries = await fs.promises.readdir(src);

    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    await fs.promises.copyFile(src, dest);
  }
}

if (require.main === module) {
  copyAdminBuild();
}

module.exports = copyAdminBuild;
