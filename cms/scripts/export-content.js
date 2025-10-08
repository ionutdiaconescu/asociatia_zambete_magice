#!/usr/bin/env node
/**
 * Export homepage & campaigns to ../frontend/public/data for static fallback.
 * Usage:
 *   FRONTEND_EXPORT_DIR=../frontend/public/data node scripts/export-content.js
 *
 * Env vars:
 *   API_BASE (default http://localhost:1337/api)
 *   FRONTEND_EXPORT_DIR (default ../frontend/public/data)
 */
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

(async () => {
  const apiBase = process.env.API_BASE || "http://localhost:1337/api";
  const outDir = path.resolve(
    __dirname,
    process.env.FRONTEND_EXPORT_DIR || "../frontend/public/data"
  );
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
    return res.json();
  }

  try {
    console.log(`Export directory: ${outDir}`);
    const homepage = await getJson(`${apiBase}/homepage?populate=*`);
    fs.writeFileSync(
      path.join(outDir, "homepage.json"),
      JSON.stringify(homepage, null, 2)
    );
    console.log("✔ homepage exported");

    const campaigns = await getJson(
      `${apiBase}/campanie-de-donatiis?pagination[limit]=100&populate=*`
    );
    fs.writeFileSync(
      path.join(outDir, "campaigns.json"),
      JSON.stringify(campaigns, null, 2)
    );
    console.log("✔ campaigns exported");

    console.log("✅ Done");
  } catch (e) {
    console.error("❌ Export failed:", e.message);
    process.exitCode = 1;
  }
})();
