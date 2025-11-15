// Middleware to serve admin static files with fallback to index.html for SPA routing
const path = require("path");
const fs = require("fs");

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Only intercept /admin paths
    if (!ctx.path.startsWith("/admin")) {
      return next();
    }

    // Try multiple potential paths for admin build
    const possibleAdminPaths = [
      path.join(__dirname, "../../dist/build"),
      path.join(
        __dirname,
        "../../node_modules/@strapi/admin/dist/server/build"
      ),
      path.join(
        __dirname,
        "../../node_modules/@strapi/core/node_modules/@strapi/admin/dist/server/build"
      ),
    ];

    // Check which path exists
    let adminBuildPath = null;
    for (const p of possibleAdminPaths) {
      if (fs.existsSync(p)) {
        adminBuildPath = p;
        break;
      }
    }

    if (!adminBuildPath) {
      console.warn("[admin-middleware] No admin build path found");
      return next();
    }

    // Serve static assets from admin build
    const requestedFile = path.join(
      adminBuildPath,
      ctx.path.replace("/admin", "")
    );

    // Security: ensure file is within admin build directory
    if (!requestedFile.startsWith(adminBuildPath)) {
      return next();
    }

    // If file exists, serve it
    if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
      ctx.type = getContentType(requestedFile);
      ctx.body = fs.readFileSync(requestedFile);
      return;
    }

    // For SPA routing, serve index.html if requesting HTML (no file extension or .html)
    const indexPath = path.join(adminBuildPath, "index.html");
    if (
      fs.existsSync(indexPath) &&
      (!path.extname(ctx.path) || ctx.path.endsWith(".html"))
    ) {
      ctx.type = "text/html";
      ctx.body = fs.readFileSync(indexPath);
      return;
    }

    return next();
  };
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };
  return mimeTypes[ext] || "application/octet-stream";
}
