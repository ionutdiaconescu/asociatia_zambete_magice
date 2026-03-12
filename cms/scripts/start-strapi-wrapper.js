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
  new Date().toISOString(),
);

// Rulează print-db-config.js la fiecare start pentru debugging
try {
  require("./print-db-config.js");
} catch (e) {
  console.error(
    "[strapi-wrapper] Eroare la execuția print-db-config.js:",
    e && e.message,
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
      "build",
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
      "build",
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
          e.message,
        );
      }
    }
  } else {
    console.log("[admin-fix] Source build nu există, skip...");
  }
} catch (error) {
  console.log("[admin-fix] Warning:", error.message);
}

// Copy API artifacts (JS + JSON schemas) from src -> dist so production runtime
// picks up route code and content-type schema updates.
try {
  const srcApiRoot = path.join(__dirname, "..", "src", "api");
  const distApiRoot = path.join(__dirname, "..", "dist", "src", "api");

  if (fs.existsSync(srcApiRoot)) {
    fs.mkdirSync(distApiRoot, { recursive: true });

    fs.cpSync(srcApiRoot, distApiRoot, {
      recursive: true,
      force: true,
      filter: (srcPath) => {
        try {
          const st = fs.statSync(srcPath);
          if (st.isDirectory()) return true;
          return /\.(js|json)$/i.test(srcPath);
        } catch (_) {
          return false;
        }
      },
    });

    console.log("[api-sync] ✅ Sincronizare src/api -> dist/src/api (js+json)");
  } else {
    console.log("[api-sync] src/api nu există, skip...");
  }
} catch (e) {
  console.log("[api-sync] Warning:", e.message);
}

const strapi = require("@strapi/strapi");
strapi.createStrapi().start();
