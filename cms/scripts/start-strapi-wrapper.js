#!/usr/bin/env node
"use strict";
// Minimal production-only wrapper for Strapi startup (in-process)
const { resolve } = require("path");
console.log(
  "[strapi-wrapper] Executing start-strapi-wrapper.js at",
  new Date().toISOString()
);
const strapi = require("@strapi/strapi");

strapi.createStrapi({ distDir: resolve(__dirname, "./dist") }).start();
