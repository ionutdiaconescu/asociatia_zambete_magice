// List all Strapi registered routes for debugging 404 issues
const { createStrapi } = require("@strapi/strapi");

(async () => {
  const strapi = await createStrapi();
  await strapi.start();
  try {
    const routes = [];
    for (const [key, api] of Object.entries(strapi.api || {})) {
      const cfg = api?.routes || [];
      cfg.forEach((r) =>
        routes.push({ type: "api", key, method: r.method, path: r.path })
      );
    }
    // plugins
    for (const [pluginName, plugin] of Object.entries(strapi.plugins || {})) {
      const pluginRoutes = plugin?.routes?.["content-api"] || [];
      pluginRoutes.forEach((r) =>
        routes.push({
          type: "plugin",
          key: pluginName,
          method: r.method,
          path: r.path,
        })
      );
    }
    console.log("--- Registered routes count:", routes.length, "---");
    routes.sort(
      (a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method)
    );
    for (const r of routes) {
      console.log(`${r.method.padEnd(6)} ${r.path} (${r.type}:${r.key})`);
    }
  } catch (e) {
    console.error("[debug:routes] ERROR", e);
  } finally {
    await strapi.destroy();
  }
})();
