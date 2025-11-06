// List all Strapi registered routes for debugging 404 issues
const { createStrapi } = require("@strapi/strapi");

(async () => {
  const strapi = await createStrapi();
  await strapi.start();
  try {
    const routes = [];

    // APIs
    for (const [key, api] of Object.entries(strapi.api || {})) {
      const cfg = api?.routes || [];
      if (Array.isArray(cfg)) {
        cfg.forEach((r) =>
          routes.push({ type: "api", key, method: r.method, path: r.path })
        );
      }
    }

    // Plugins - robust handling for various plugin.routes shapes
    for (const [pluginName, plugin] of Object.entries(strapi.plugins || {})) {
      const pr = plugin?.routes;
      if (!pr) continue;

      // If plugin.routes is an array
      if (Array.isArray(pr)) {
        pr.forEach((r) =>
          routes.push({
            type: "plugin",
            key: pluginName,
            method: r.method,
            path: r.path,
          })
        );
        continue;
      }

      // If plugin.routes is an object with grouped routes
      if (typeof pr === "object") {
        for (const [groupKey, groupRoutes] of Object.entries(pr)) {
          if (Array.isArray(groupRoutes)) {
            groupRoutes.forEach((r) =>
              routes.push({
                type: `plugin:${groupKey}`,
                key: pluginName,
                method: r.method,
                path: r.path,
              })
            );
            continue;
          }

          // If groupRoutes is an object map: try to extract values which may be route objects or arrays
          if (groupRoutes && typeof groupRoutes === "object") {
            for (const val of Object.values(groupRoutes)) {
              if (!val) continue;
              if (Array.isArray(val)) {
                val.forEach((r) =>
                  routes.push({
                    type: `plugin:${groupKey}`,
                    key: pluginName,
                    method: r.method,
                    path: r.path,
                  })
                );
              } else if (typeof val === "object" && (val.method || val.path)) {
                // Single route-like object
                routes.push({
                  type: `plugin:${groupKey}`,
                  key: pluginName,
                  method: val.method,
                  path: val.path,
                });
              }
            }
          } else {
            // Unexpected shape: log it for inspection
            console.log(
              `[debug:routes] plugin ${pluginName} group ${groupKey} has unexpected shape`
            );
          }
        }
      }
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
