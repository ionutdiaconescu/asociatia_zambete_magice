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

  // Instead of hard-coding multiple brittle paths (some with duplicated 'server'),
  // scan node_modules for any occurrence of @strapi/admin that contains a built admin
  // and use the first match. Keep local dist/build and public/admin as fallbacks.
  function findAdminTargets() {
    const results = new Set();

    // Always prefer the local built admin in project dist
    results.add(path.join(__dirname, "..", "dist", "build"));

    // Walk node_modules (bounded depth) to find @strapi/admin directories
    const nmRoot = path.join(__dirname, "..", "node_modules");
    function walk(dir, depth = 0) {
      if (depth > 6) return;
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (e) {
        return;
      }
      for (const ent of entries) {
        if (!ent.isDirectory()) continue;
        const name = ent.name;
        const p = path.join(dir, name);
        // Direct @strapi scope, check admin inside
        if (name === "@strapi") {
          const adminCandidate = path.join(
            p,
            "admin",
            "dist",
            "server",
            "build"
          );
          if (fs.existsSync(adminCandidate)) results.add(adminCandidate);
          // also older nested shape inside core
          const coreAdminCandidate = path.join(
            p,
            "core",
            "node_modules",
            "@strapi",
            "admin",
            "dist",
            "server",
            "build"
          );
          if (fs.existsSync(coreAdminCandidate))
            results.add(coreAdminCandidate);
        }
        // Recurse into this directory to find deeper scopes
        walk(p, depth + 1);
      }
    }
    walk(nmRoot, 0);

    // Finally fall back to public/admin
    results.add(path.join(__dirname, "..", "public", "admin"));

    return Array.from(results);
  }

  const possibleTargets = findAdminTargets();

  if (
    fs.existsSync(sourcePath) &&
    fs.existsSync(path.join(sourcePath, "index.html"))
  ) {
    let copied = false;
    for (const targetPath of possibleTargets) {
      try {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.cpSync(sourcePath, targetPath, { recursive: true, force: true });
        console.log("[admin-fix] ✅ Admin build copiat în:", targetPath);
        copied = true;
        break; // Stop after first successful copy
      } catch (e) {
        // Ignore and try next path
      }
    }
    if (!copied) {
      console.log(
        "[admin-fix] ⚠️ Nu s-a putut copia admin build în nici o cale"
      );
    }
  } else {
    console.log("[admin-fix] Source build nu există, skip...");
  }
} catch (error) {
  console.log("[admin-fix] Warning:", error.message);
}

const strapi = require("@strapi/strapi");
strapi.createStrapi().start();
