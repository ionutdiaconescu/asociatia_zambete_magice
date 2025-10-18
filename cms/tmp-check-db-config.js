// Temporary check to require config/database.js with a simple env helper
const path = require("path");
const cfgFactory = require("./config/database");
const envShim = (k, d) => {
  const v = process.env[k];
  if (typeof v === "undefined" || v === null) return d;
  return v;
};
try {
  const cfg = cfgFactory({ env: envShim });
  console.log("OK: loaded config:");
  console.log(JSON.stringify(cfg, null, 2));
} catch (e) {
  console.error("ERROR requiring config:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
