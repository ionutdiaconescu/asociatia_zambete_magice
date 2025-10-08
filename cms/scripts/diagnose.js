// Quick backend diagnosis: prints DB client, tries a simple query, lists core tables & API routes count.
// Usage: npm run diagnose

const { createStrapi } = require("@strapi/strapi");

(async () => {
  const started = Date.now();
  console.log("[diagnose] Booting Strapi...");
  let strapi;
  try {
    strapi = await createStrapi();
    await strapi.start();
  } catch (e) {
    console.error("[diagnose] FAILED to start Strapi:", e.message);
    console.error("Stack:", e.stack?.split("\n").slice(0, 8).join("\n"));
    process.exit(1);
  }
  try {
    const dbCfg = strapi.config.get("database.connection");
    console.log("[diagnose] DB client      :", dbCfg.client);
    if (dbCfg.connection?.host)
      console.log(
        "[diagnose] Host           :",
        dbCfg.connection.host + ":" + dbCfg.connection.port
      );
    console.log(
      "[diagnose] Database       :",
      dbCfg.connection?.database || "(sqlite file)"
    );

    // Simple NOW() / datetime depending on client
    if (dbCfg.client === "postgres") {
      const r = await strapi.db.connection.raw("SELECT NOW() as now");
      console.log("[diagnose] NOW()          :", r.rows[0].now);
    } else {
      const r = await strapi.db.connection.raw('SELECT datetime("now") as now');
      console.log("[diagnose] datetime(now)  :", r[0].now);
    }

    // List a few expected tables / content-types
    const models = Object.keys(strapi.contentTypes || {});
    console.log("[diagnose] ContentTypes    :", models.length);
    const custom = models.filter((m) => m.startsWith("api::")).sort();
    console.log("  - custom UIDs:", custom);

    // Count admin users
    try {
      const adminCount = await strapi.db.query("admin::user").count();
      console.log("[diagnose] Admin users     :", adminCount);
    } catch (e) {
      console.warn("[diagnose] Cannot count admin users:", e.message);
    }

    // Quick route count (content-api)
    const routes = [];
    for (const [k, api] of Object.entries(strapi.api || {})) {
      (api.routes || []).forEach((r) => routes.push(r.path));
    }
    console.log("[diagnose] API route paths :", routes.length);
    console.log("  - sample:", routes.slice(0, 10));
  } catch (e) {
    console.error("[diagnose] ERROR during diagnostics:", e);
  } finally {
    await strapi.destroy();
    console.log("[diagnose] Finished in", Date.now() - started + "ms");
  }
})();
