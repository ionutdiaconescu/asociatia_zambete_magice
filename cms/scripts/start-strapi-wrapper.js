#!/usr/bin/env node
"use strict";
// Minimal production-only wrapper for Strapi startup (in-process)
const { resolve } = require("path");
const strapi = require("@strapi/strapi");

strapi.createStrapi({ distDir: resolve(__dirname, "./dist") }).start();
