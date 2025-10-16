// Lightweight inspector for DATABASE_URL (safe: masks password)
const path = require("path");
try {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
} catch (e) {}

const u = process.env.DATABASE_URL || "";

function maskUrl(url) {
  // mask password between : and @ for postgres connection strings
  return url.replace(/(postgresql:\/\/[^:]+):([^@]+)@/, (m, a) => `${a}:***@`);
}

const masked = maskUrl(u);
const trimmed = u.trim();
const hasLeadingTrailing = u !== trimmed;
const whitespaceAnywhere = /\s/.test(u);
const controlChars = (u.match(/[\x00-\x1F\x7F]/g) || []).length;
const startsWithProto = u.startsWith("postgresql://");
const endsWithPostgres = u.endsWith("/postgres") || /:\d+\/postgres$/.test(u);

console.log("[inspect-db] masked DATABASE_URL:", masked ? masked : "(missing)");
console.log("[inspect-db] length:", u.length);
console.log("[inspect-db] startsWith postgresql:// ? ", startsWithProto);
console.log("[inspect-db] endsWith /postgres ? ", endsWithPostgres);
console.log(
  "[inspect-db] has leading/trailing whitespace ? ",
  hasLeadingTrailing
);
console.log("[inspect-db] any whitespace anywhere ? ", whitespaceAnywhere);
console.log(
  "[inspect-db] control characters count (\x00-\x1F,\x7F):",
  controlChars
);
console.log(
  "[inspect-db] PORT env (runtime):",
  process.env.PORT || "(not set)"
);

// print small preview safely
function preview(s, n = 40) {
  if (!s) return "";
  if (s.length <= n * 2) return s;
  return s.slice(0, n) + "..." + s.slice(-n);
}
console.log("[inspect-db] preview masked (safe):", preview(masked, 40));

if (!u) process.exit(1);
if (hasLeadingTrailing || whitespaceAnywhere || controlChars > 0)
  process.exit(2);
process.exit(0);
