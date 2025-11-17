#!/usr/bin/env node
"use strict";
// Încarcă variabilele din .env local (doar pentru dezvoltare/local)
require("dotenv").config();
// Minimal production-only wrapper for Strapi startup (in-process)
const { resolve } = require("path");
const fs = require("fs");
const path = require("path");

console.log(
  "[strapi-wrapper] Executing start-strapi-wrapper.js at",
  new Date().toISOString()
);

// Rulează print-db-config.js la fiecare start pentru debugging
try {
  require("./print-db-config.js");
} catch (e) {
  console.error(
    "[strapi-wrapper] Eroare la execuția print-db-config.js:",
    e && e.message
  );
}

// Fix admin panel - copiază build-ul în locația EXACTĂ unde Strapi îl caută
try {
  const sourcePath = path.join(__dirname, "..", "dist", "build");

  // Copiază admin build în AMBELE locații (cu și fără server duplicat)
  const targetPaths = [
    path.join(
      __dirname,
      "..",
      "node_modules",
      "@strapi",
      "admin",
      "dist",
      "server",
      "build"
    ),
    path.join(
      __dirname,
      "..",
      "node_modules",
      "@strapi",
      "admin",
      "dist",
      "server",
      "server",
      "build"
    ),
  ];

  if (
    fs.existsSync(sourcePath) &&
    fs.existsSync(path.join(sourcePath, "index.html"))
  ) {
    for (const targetPath of targetPaths) {
      try {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.cpSync(sourcePath, targetPath, {
          recursive: true,
          force: true,
        });
        console.log("[admin-fix] ✅ Admin build copiat în:", targetPath);
      } catch (e) {
        console.log(
          "[admin-fix] ⚠️ Eroare copiere la",
          targetPath,
          ":",
          e.message
        );
      }
    }
  } else {
    console.log("[admin-fix] Source build nu există, skip...");
  }
} catch (error) {
  console.log("[admin-fix] Warning:", error.message);
}

// Copy API JS (controllers/services/routes) from src -> dist so production loads routes
try {
  const srcApiRoot = path.join(__dirname, "..", "src", "api");
  const distApiRoot = path.join(__dirname, "..", "dist", "src", "api");

  if (fs.existsSync(srcApiRoot)) {
    const apis = fs.readdirSync(srcApiRoot).filter((d) => {
      try {
        return fs.statSync(path.join(srcApiRoot, d)).isDirectory();
      } catch (_) {
        return false;
      }
    });

    for (const apiName of apis) {
      const subDirs = ["controllers", "services", "routes"];
      for (const sub of subDirs) {
        const fromDir = path.join(srcApiRoot, apiName, sub);
        if (!fs.existsSync(fromDir)) continue;

        const toDir = path.join(distApiRoot, apiName, sub);
        fs.mkdirSync(toDir, { recursive: true });

        const entries = fs
          .readdirSync(fromDir)
          .filter((f) => f.endsWith(".js"));
        for (const file of entries) {
          const from = path.join(fromDir, file);
          const to = path.join(toDir, file);
          try {
            fs.copyFileSync(from, to);
            console.log(`[api-sync] Copiat ${apiName}/${sub}/${file}`);
          } catch (e) {
            console.log(
              `[api-sync] ⚠️ Eroare copiere ${apiName}/${sub}/${file}:`,
              e.message
            );
          }
        }
      }
    }
  } else {
    console.log("[api-sync] src/api nu există, skip...");
  }
} catch (e) {
  console.log("[api-sync] Warning:", e.message);
}

const strapi = require("@strapi/strapi");
strapi.createStrapi().start();
