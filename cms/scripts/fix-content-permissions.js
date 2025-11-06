// Script pentru verificarea și repararea permisiunilor pentru content types
const { createStrapi } = require("@strapi/strapi");

(async () => {
  console.log(
    "[content-permissions] Starting content type permissions verification..."
  );

  const strapi = await createStrapi();
  await strapi.start();

  try {
    // 1. Găsește rolul Super Admin și adminul activ
    const superAdminRole = await strapi.db.query("admin::role").findOne({
      where: { code: "strapi-super-admin" },
    });

    const activeAdmin = await strapi.db.query("admin::user").findOne({
      where: { blocked: false },
      populate: ["roles"],
    });

    console.log(`Super Admin Role ID: ${superAdminRole.id}`);
    console.log(`Active Admin: ${activeAdmin.email} (ID: ${activeAdmin.id})`);

    // 2. Găsește toate content types disponibile
    console.log("\n=== CONTENT TYPES DISPONIBILE ===");
    const contentTypes = Object.keys(strapi.contentTypes)
      .filter((uid) => uid.startsWith("api::"))
      .map((uid) => ({
        uid,
        name: strapi.contentTypes[uid].info?.displayName || uid,
      }));

    console.log(`Găsit ${contentTypes.length} content types:`);
    contentTypes.forEach((ct) => {
      console.log(`- ${ct.uid} (${ct.name})`);
    });

    // 3. Verifică permisiuni existente pentru content types
    console.log("\n=== VERIFICARE PERMISIUNI CONTENT TYPES ===");

    const existingPermissions = await strapi.db
      .query("admin::permission")
      .findMany({
        where: { role: superAdminRole.id },
        select: ["action", "subject"],
      });

    console.log(
      `Super Admin are ${existingPermissions.length} permisiuni totale`
    );

    // 4. Creează permisiuni pentru fiecare content type
    const requiredActions = [
      "plugin::content-manager.explorer.create",
      "plugin::content-manager.explorer.read",
      "plugin::content-manager.explorer.update",
      "plugin::content-manager.explorer.delete",
      "plugin::content-manager.explorer.publish",
    ];

    let createdPermissions = 0;

    for (const contentType of contentTypes) {
      console.log(`\nVerific permisiuni pentru ${contentType.uid}:`);

      for (const action of requiredActions) {
        const exists = existingPermissions.some(
          (p) => p.action === action && p.subject === contentType.uid
        );

        if (!exists) {
          try {
            await strapi.db.query("admin::permission").create({
              data: {
                action: action,
                subject: contentType.uid,
                role: superAdminRole.id,
              },
            });
            console.log(`  ✅ Creat: ${action}`);
            createdPermissions++;
          } catch (error) {
            console.log(`  ❌ Eroare: ${action} - ${error.message}`);
          }
        } else {
          console.log(`  ✓ Există: ${action}`);
        }
      }
    }

    // 5. Adaugă și permisiuni generale pentru API
    console.log("\n=== PERMISIUNI API GENERALE ===");
    const generalPermissions = [
      "plugin::content-manager.single-types.configure-view",
      "plugin::content-manager.collection-types.configure-view",
      "plugin::content-manager.components.configure-layout",
      "admin::marketplace.read",
      "admin::webhooks.create",
      "admin::webhooks.read",
      "admin::webhooks.update",
      "admin::webhooks.delete",
      "admin::users.create",
      "admin::users.read",
      "admin::users.update",
      "admin::users.delete",
      "admin::roles.create",
      "admin::roles.read",
      "admin::roles.update",
      "admin::roles.delete",
    ];

    for (const action of generalPermissions) {
      const exists = existingPermissions.some((p) => p.action === action);

      if (!exists) {
        try {
          await strapi.db.query("admin::permission").create({
            data: {
              action: action,
              subject: null,
              role: superAdminRole.id,
            },
          });
          console.log(`✅ Creat general: ${action}`);
          createdPermissions++;
        } catch (error) {
          console.log(`❌ Eroare general: ${action} - ${error.message}`);
        }
      }
    }

    console.log(`\n🎉 FINALIZAT! Creat ${createdPermissions} permisiuni noi`);
    console.log("Admin panel ar trebui să funcționeze complet acum!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await strapi.destroy();
  }
})();
