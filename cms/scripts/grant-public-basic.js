/*
 Grant Public role basic read permissions for Homepage, Campaigns, and Pages.
 Also creates/publishes a minimal Homepage entry if missing.
*/
require("dotenv").config();
const { createStrapi } = require("@strapi/strapi");

(async () => {
  const app = await createStrapi().load();
  try {
    const rolePublic = await app.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });
    if (!rolePublic) throw new Error("Public role not found");

    const actions = [
      "api::homepage.homepage.find",
      "api::homepage.homepage.findOne",
      "api::campaign.campaign.find",
      "api::campaign.campaign.findOne",
      "api::page.page.find",
      "api::page.page.findOne",
    ];

    const Permission = "plugin::users-permissions.permission";
    for (const action of actions) {
      const exists = await app.entityService.findMany(Permission, {
        filters: { action, role: rolePublic.id },
        limit: 1,
      });
      if (!exists?.length) {
        await app.entityService.create(Permission, {
          data: { action, role: rolePublic.id, enabled: true },
        });
        console.log("Granted:", action);
      } else {
        // Ensure it's enabled
        const p = exists[0];
        if (p.enabled !== true) {
          await app.entityService.update(Permission, p.id, {
            data: { enabled: true },
          });
          console.log("Enabled:", action);
        } else {
          console.log("Exists:", action);
        }
      }
    }

    // Ensure Homepage single exists and is published
    const uidHomepage = "api::homepage.homepage";
    let hp = await app.entityService.findMany(uidHomepage, { limit: 1 });
    if (!hp || hp.length === 0) {
      hp = [
        await app.entityService.create(uidHomepage, {
          data: {
            heroTitle: "Transformăm nevoi în zâmbete magice",
            heroSubtitle: "Fiecare copil merită o șansă",
            heroDescription:
              "Asociația Zâmbete Magice lucrează pentru copiii care au nevoie de sprijin în Timișoara și împrejurimi.",
            publishedAt: new Date(),
          },
        }),
      ];
      console.log("Created homepage entry");
    } else if (!hp[0].publishedAt) {
      await app.entityService.update(uidHomepage, hp[0].id, {
        data: { publishedAt: new Date() },
      });
      console.log("Published existing homepage");
    } else {
      console.log("Homepage already present and published");
    }

    console.log("✅ Public permissions granted and homepage ensured.");
  } catch (err) {
    console.error("Failed to grant public permissions:", err);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
