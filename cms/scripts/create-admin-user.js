// Create an admin user directly (bypassing the /admin register wizard)
// Usage:
// 1. Setează variabilele de mediu:
//    RESET_ADMIN_EMAIL (ex: admin@site.com)
//    RESET_ADMIN_PASSWORD (ex: parola123)
//    RESET_ADMIN_FIRSTNAME (opțional)
//    RESET_ADMIN_LASTNAME (opțional)
// 2. Asigură-te că toate variabilele din .env și Render Environment tab sunt corecte (DATABASE_*, APP_KEYS, ENCRYPTION_KEY, JWT/ADMIN_JWT etc).
// 3. Rulează: node scripts/create-admin-user.js
//    sau: npm run admin:create
// 4. După rulare, poți accesa /admin cu emailul și parola setate.

const { createStrapi } = require("@strapi/strapi");

(async () => {
  const email = process.env.RESET_ADMIN_EMAIL;
  const password = process.env.RESET_ADMIN_PASSWORD;
  const firstname = process.env.RESET_ADMIN_FIRSTNAME || "Admin";
  const lastname = process.env.RESET_ADMIN_LASTNAME || "User";

  if (!email || !password) {
    console.error("Must set RESET_ADMIN_EMAIL and RESET_ADMIN_PASSWORD in env");
    process.exit(1);
  }

  console.log("[admin:create] Booting Strapi...");
  const strapi = await createStrapi();
  await strapi.start();

  try {
    const existing = await strapi.db
      .query("admin::user")
      .findOne({ where: { email } });
    if (existing) {
      console.log("[admin:create] User already exists with email", email);
      process.exit(0);
    }

    const hashed = await strapi.admin.services.auth.hashPassword(password);
    const superAdminRole = await strapi.db
      .query("admin::role")
      .findOne({ where: { code: "strapi-super-admin" } });

    if (!superAdminRole) {
      throw new Error(
        "Super Admin role not found. Has the schema been created?"
      );
    }

    const user = await strapi.db.query("admin::user").create({
      data: {
        email,
        password: hashed,
        firstname,
        lastname,
        isActive: true,
        roles: [superAdminRole.id],
      },
      populate: ["roles"],
    });

    console.log(
      "[admin:create] Created admin user id=" + user.id + " email=" + email
    );
  } catch (e) {
    console.error("[admin:create] ERROR:", e);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
