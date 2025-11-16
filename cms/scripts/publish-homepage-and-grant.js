// Publishes homepage single type if not published and grants Public role API permissions
// Usage: node scripts/publish-homepage-and-grant.js

const { createStrapi } = require("@strapi/strapi");

async function run() {
  const strapi = await createStrapi({ distDir: "dist" });
  await strapi.start();
  try {
    const log = console.log;
    // 1. Publish homepage if needed
    const uid = "api::homepage.homepage";
    let home = await strapi.entityService.findMany(uid, { populate: "*" });
    home = Array.isArray(home) ? home[0] : home;
    if (!home) {
      log("❌ Homepage entry not found. Create it in Admin first.");
    } else if (!home.publishedAt) {
      await strapi.entityService.update(uid, home.id, {
        data: { publishedAt: new Date() },
      });
      log("✅ Homepage published now.");
    } else {
      log("✅ Homepage already published.");
    }

    // 2. Grant permissions for Public role (users-permissions plugin)
    const publicRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });
    if (!publicRole) {
      log("❌ Public role not found.");
    } else {
      const needed = [
        "api::homepage.homepage.find",
        "api::homepage.homepage.findOne",
        "api::campanie-de-donatii.campanie-de-donatii.find",
        "api::campanie-de-donatii.campanie-de-donatii.findOne",
      ];
      for (const action of needed) {
        const exists = await strapi.db
          .query("plugin::users-permissions.permission")
          .findOne({ where: { action, role: publicRole.id } });
        if (!exists) {
          await strapi.db
            .query("plugin::users-permissions.permission")
            .create({
              data: { action, role: publicRole.id, actionParameters: {} },
            });
          log("Granted: " + action);
        } else {
          log("Already granted: " + action);
        }
      }
    }

    // 3. Output test URLs hint
    log("\nTest endpoints now:");
    log(
      "- GET https://asociatia-zambete-magice.onrender.com/api/homepage?populate=*"
    );
    log(
      "- GET https://asociatia-zambete-magice.onrender.com/api/campanie-de-donatiis?populate=coverImage"
    );
  } catch (e) {
    console.error("❌ Script error:", e);
  } finally {
    await strapi.destroy();
  }
}

run();
