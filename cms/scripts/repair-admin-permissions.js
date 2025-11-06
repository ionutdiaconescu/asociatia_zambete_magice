// Script pentru repararea permisiunilor Super Admin
const { createStrapi } = require("@strapi/strapi");

(async () => {
  console.log("[fix-permissions] Starting Super Admin permissions repair...");

  const strapi = await createStrapi();
  await strapi.start();

  try {
    // Găsește rolul Super Admin
    const superAdminRole = await strapi.db.query("admin::role").findOne({
      where: { code: "strapi-super-admin" },
      populate: ["permissions"],
    });

    if (!superAdminRole) {
      console.log("❌ Super Admin role not found!");
      return;
    }

    console.log(
      `Super Admin role found: ${superAdminRole.permissions.length} permissions`
    );

    // Permisiunile critice care trebuie să existe
    const criticalPermissions = [
      // Content Manager
      { action: "plugin::content-manager.explorer.create", subject: null },
      { action: "plugin::content-manager.explorer.read", subject: null },
      { action: "plugin::content-manager.explorer.update", subject: null },
      { action: "plugin::content-manager.explorer.delete", subject: null },

      // Upload / Media Library
      { action: "plugin::upload.read", subject: null },
      { action: "plugin::upload.assets.create", subject: null },
      { action: "plugin::upload.assets.update", subject: null },
      { action: "plugin::upload.assets.download", subject: null },
      { action: "plugin::upload.assets.copy-link", subject: null },

      // Content Type Builder
      { action: "plugin::content-type-builder.read", subject: null },
      { action: "plugin::content-type-builder.create", subject: null },
      { action: "plugin::content-type-builder.update", subject: null },
      { action: "plugin::content-type-builder.delete", subject: null },
    ];

    console.log("\nCreating missing permissions...");
    let created = 0;

    for (const permData of criticalPermissions) {
      // Verifică dacă permisiunea există deja
      const existing = await strapi.db.query("admin::permission").findOne({
        where: {
          action: permData.action,
          role: superAdminRole.id,
        },
      });

      if (!existing) {
        // Creează permisiunea
        await strapi.db.query("admin::permission").create({
          data: {
            action: permData.action,
            subject: permData.subject,
            role: superAdminRole.id,
          },
        });
        console.log(`✅ Created: ${permData.action}`);
        created++;
      } else {
        console.log(`✓ Exists: ${permData.action}`);
      }
    }

    console.log(`\n✅ Created ${created} missing permissions`);
    console.log("🎉 Super Admin permissions repair complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await strapi.destroy();
  }
})();
