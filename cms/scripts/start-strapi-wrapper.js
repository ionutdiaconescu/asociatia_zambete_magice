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

  // Strapi 5.30.1 servește admin din /admin path direct; build-ul trebuie să fie accesibil
  // Încercă mai multe căi posibile
  const possibleTargets = [
    // Calea pentru Strapi 5.30.1 (newer)
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
    // Calea pentru Strapi older nested location (without duplicated 'server')
    path.join(
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
      "build"
    ),
    // Calea directă public/admin
    path.join(__dirname, "..", "public", "admin"),
  ];

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
