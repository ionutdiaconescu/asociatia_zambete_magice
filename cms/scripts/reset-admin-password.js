// Reset an existing admin user's password safely via Strapi services
// Usage:
//  RESET_ADMIN_EMAIL, RESET_ADMIN_PASSWORD must be set.
//   node scripts/reset-admin-password.js
// or: npm run admin:reset

const { createStrapi } = require("@strapi/strapi");

(async () => {
  const email = process.env.RESET_ADMIN_EMAIL;
  const password = process.env.RESET_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Must set RESET_ADMIN_EMAIL and RESET_ADMIN_PASSWORD");
    process.exit(1);
  }

  console.log("[admin:reset] Booting Strapi...");
  const strapi = await createStrapi();
  await strapi.start();

  try {
    const user = await strapi.db
      .query("admin::user")
      .findOne({ where: { email } });
    if (!user) {
      console.error("[admin:reset] No admin user found with email", email);
      process.exit(1);
    }
    const hashed = await strapi.admin.services.auth.hashPassword(password);
    await strapi.db.query("admin::user").update({
      where: { id: user.id },
      data: { password: hashed },
    });
    console.log("[admin:reset] Password updated for", email);
  } catch (e) {
    console.error("[admin:reset] ERROR:", e);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
