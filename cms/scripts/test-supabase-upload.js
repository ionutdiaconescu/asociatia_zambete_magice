"use strict";

// Quick test script to verify Supabase upload provider works with Strapi v5.
// Usage: node scripts/test-supabase-upload.js <path-to-file>

const path = require("path");
const fs = require("fs");
const { createStrapi } = require("@strapi/strapi");

async function run() {
  const filePath = process.argv[2] || path.join(__dirname, "../README.md");
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
  }

  // Gather file info for Strapi upload service expected shape
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath) || ".txt";
  let mime = "text/plain";
  if (ext === ".png") mime = "image/png";
  else if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
  else if (ext === ".gif") mime = "image/gif";
  else if (ext === ".webp") mime = "image/webp";

  console.log("[test-upload] creating Strapi instance (no HTTP server)...");
  // Load Strapi without starting the HTTP server to avoid port conflicts
  const strapi = await createStrapi().load();

  try {
    const uploadService = strapi.plugin("upload").service("upload");
    console.log("[test-upload] invoking upload service...");
    // Build file object in the shape Strapi expects (originalFilename, mimetype, size, filepath)
    const res = await uploadService.upload({
      data: { fileInfo: {} },
      files: [
        {
          originalFilename: path.basename(filePath),
          mimetype: mime,
          size: stats.size,
          filepath: filePath,
        },
      ],
    });
    console.log("[test-upload] upload response:", res);
  } catch (err) {
    console.error("[test-upload] error", err);
  } finally {
    await strapi.destroy();
  }
}

run();
