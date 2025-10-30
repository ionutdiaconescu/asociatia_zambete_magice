#!/usr/bin/env node
// shim to support deployments that run `node start-strapi-wrapper.js`
// The real, authoritative wrapper lives at ./scripts/start-strapi-wrapper.js
require("dotenv").config();
try {
  require("./scripts/start-strapi-wrapper.js");
} catch (err) {
  // If anything goes wrong, print a helpful error and rethrow so the
  // deployment logs contain the failure details.
  console.error(
    "[shim] Failed to require ./scripts/start-strapi-wrapper.js:",
    err && err.stack ? err.stack : err
  );
  throw err;
}
