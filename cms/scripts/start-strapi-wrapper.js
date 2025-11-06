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

  if (
    fs.existsSync(sourcePath) &&
    fs.existsSync(path.join(sourcePath, "index.html"))
  ) {
    console.log(
      "[admin-fix] Copiez build admin din",
      sourcePath,
      "în",
      targetPath
    );
    // Creează directorul target dacă nu există
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.cpSync(sourcePath, targetPath, { recursive: true, force: true });
    console.log("[admin-fix] ✅ Admin build copiat cu succes!");
  } else {
    console.log("[admin-fix] Source build nu există, skip...");
  }
} catch (error) {
  console.log("[admin-fix] Warning:", error.message);
}

const strapi = require("@strapi/strapi");
strapi.createStrapi().start();
