#!/usr/bin/env node
"use strict";
// Minimal production-only wrapper for Strapi startup (in-process)
const { resolve } = require("path");
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

const strapi = require("@strapi/strapi");
strapi.createStrapi({ distDir: resolve(__dirname, "./dist") }).start();
