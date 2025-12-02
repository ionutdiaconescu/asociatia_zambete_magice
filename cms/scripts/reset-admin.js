"use strict";
const { createStrapi } = require("@strapi/strapi");

async function run() {
  const email = process.env.ADMIN_EMAIL || "diaconescuionut95@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "14081995.IonuttttP";
  const firstname = process.env.ADMIN_FIRSTNAME || "Ionut";
  const lastname = process.env.ADMIN_LASTNAME || "Admin";

  console.log("[reset-admin] starting Strapi (no HTTP server)...");
  const strapi = await createStrapi().load();
  try {
    const authService = strapi.admin.services.auth;
    const hashed = await authService.hashPassword(password);

    // Find existing admin user by email
    const existing = await strapi.db
      .query("admin::user")
      .findOne({ where: { email } });

    if (!existing) {
      console.log("[reset-admin] no admin found, creating Super Admin:", email);
      // Get Super Admin role
      const superAdmin = await strapi.db
        .query("admin::role")
        .findOne({ where: { code: "strapi-super-admin" } });

      // Create user via direct DB query
      await strapi.db.query("admin::user").create({
        data: {
          email,
          firstname,
          lastname,
          password: hashed,
          isActive: true,
          roles: [superAdmin.id],
        },
      });
      console.log("[reset-admin] created admin user:", email);
    } else {
      console.log("[reset-admin] resetting password for:", existing.email);
      await strapi.db.query("admin::user").update({
        where: { id: existing.id },
        data: { password: hashed },
      });
      console.log("[reset-admin] password reset OK");
    }
  } catch (err) {
    console.error(
      "[reset-admin] ERROR:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
