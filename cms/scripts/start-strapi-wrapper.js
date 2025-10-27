#!/usr/bin/env node
"use strict";
// Minimal production-only wrapper for Strapi startup
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Find the local Strapi CLI binary
const localBin = path.resolve(
  __dirname,
  "..",
  "node_modules",
  ".bin",
  process.platform === "win32" ? "strapi.cmd" : "strapi"
);
let cmd, args;
if (fs.existsSync(localBin)) {
  cmd = localBin;
  args = ["start"];
  console.log("[wrapper] Using local strapi binary:", localBin);
} else {
  cmd = process.platform === "win32" ? "npx.cmd" : "npx";
  args = ["--no-install", "strapi", "start"];
  console.log(
    "[wrapper] Local strapi not found, falling back to npx --no-install"
  );
}

const useShell = process.platform === "win32";
const child = spawn(cmd, args, {
  cwd: path.resolve(__dirname, ".."),
  stdio: "inherit",
  env: process.env,
  shell: useShell,
});

child.on("exit", (code) => {
  process.exit(code);
});
