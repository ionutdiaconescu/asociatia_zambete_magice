// Bootstrap the Strapi application to force-run migrations & schema creation
// Usage: ensure all DATABASE_* env vars + APP_KEYS + core secrets are set, then:
//   node scripts/bootstrap-db.js
// or via npm script:
//   npm run bootstrap:db

const { createStrapi } = require("@strapi/strapi");

(async () => {
  const startedAt = Date.now();
  try {
    console.log("[bootstrap-db] Starting Strapi to run migrations...");
    const strapi = await createStrapi();
    await strapi.start();
    console.log("[bootstrap-db] Strapi started. Schema should now be created.");
    // List a couple of known tables existence (optional quick check)
    try {
      const hasAdminUsers = await strapi.db.connection.raw(
        "select to_regclass('public.strapi_admin_users') as exists"
      );
      console.log(
        "[bootstrap-db] strapi_admin_users table:",
        hasAdminUsers.rows?.[0]?.exists ? "present" : "MISSING"
      );
    } catch (e) {
      console.warn(
        "[bootstrap-db] Could not verify strapi_admin_users table:",
        e.message
      );
    }
    await strapi.destroy();
    console.log("[bootstrap-db] Done in", Date.now() - startedAt + "ms");
  } catch (err) {
    console.error("[bootstrap-db] FAILED:", err);
    process.exitCode = 1;
  }
})();
