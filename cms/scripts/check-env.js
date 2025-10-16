// Small helper to log critical env vars (masked) for Render logs debugging
function mask(s) {
  if (!s) return s;
  try {
    return s.replace(/([^:\/]+:\/\/[^:]+:)([^@]+)(@.*)/, "$1***$3");
  } catch (e) {
    return "***";
  }
}

console.log("[check-env] NODE_VERSION=", process.version);
console.log("[check-env] DATABASE_CLIENT=", process.env.DATABASE_CLIENT);
console.log("[check-env] DATABASE_URL=", mask(process.env.DATABASE_URL));
console.log("[check-env] DATABASE_SSL=", process.env.DATABASE_SSL);
console.log("[check-env] DEBUG_DB_CONFIG=", process.env.DEBUG_DB_CONFIG);
console.log("[check-env] HOST=", process.env.HOST);
console.log("[check-env] PORT=", process.env.PORT);
console.log("[check-env] PUBLIC_URL=", process.env.PUBLIC_URL);
console.log("[check-env] SUPABASE_API_URL=", process.env.SUPABASE_API_URL);
console.log(
  "[check-env] SUPABASE_API_KEY=",
  process.env.SUPABASE_API_KEY ? "***" : undefined
);

// Ensure script doesn't throw
process.exitCode = 0;
