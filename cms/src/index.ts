// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    try {
      const id = process.env.WRAPPER_SENTINEL_ID || "<none>";
      // Use strapi logger if available, fallback to console
      const log =
        strapi && strapi.log && strapi.log.info
          ? strapi.log.info.bind(strapi.log)
          : console.log;
      log(`[strapi-sentinel] WRAPPER_SENTINEL_ID=${id}`);

      // Try to read the evaluated DB config to show which DB user Strapi will use
      try {
        // require the runtime config module (it uses process.env internally)
        // path is relative to src; config/database.js is at ../config/database.js
        // call it with a minimal env accessor to avoid side effects
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const dbModule = require("../config/database");
        const dbCfg = dbModule({
          env: (k: string, d: any) => process.env[k] ?? d,
        });
        const user =
          dbCfg &&
          dbCfg.connection &&
          dbCfg.connection.connection &&
          dbCfg.connection.connection.user;
        log(`[strapi-sentinel] db.user=${user || "<none>"}`);
      } catch (e) {
        try {
          const errLog =
            strapi && strapi.log && strapi.log.error
              ? strapi.log.error.bind(strapi.log)
              : console.error;
          errLog(
            `[strapi-sentinel] failed to evaluate DB config: ${e && e.message ? e.message : String(e)}`
          );
        } catch (_) {
          // ignore
        }
      }

      // Removed legacy emergency & production admin fix and permission dedup logic.
      // These were causing duplicate action registration ("Duplicated item key").
      // Keep bootstrap lean to avoid interfering with Content Manager.

      // (Optional) Automatic public permission granting removed to prevent surprise side-effects.
      // Manage role permissions manually from the Admin UI.

      // Auto-grant public permissions after all plugins and routes are loaded
      // Use longer delay to ensure routes are fully registered
      setTimeout(async () => {
        try {
          log("\n🔧 Auto-granting public permissions...");

          const publicRole = await strapi
            .query("plugin::users-permissions.role")
            .findOne({
              where: { type: "public" },
            });

          if (!publicRole) {
            log("⚠️  Public role not found");
            return;
          }

          // Get all valid routes from users-permissions plugin
          let validActions = [];
          try {
            // Use the plugin's own method to get routes safely
            const routes = await strapi
              .plugin("users-permissions")
              .service("usersPermissions")
              .getRoutes();

            // Extract actions from routes
            Object.values(routes).forEach((routeGroup: any) => {
              if (routeGroup?.controllers) {
                Object.values(routeGroup.controllers).forEach(
                  (controller: any) => {
                    Object.keys(controller || {}).forEach((action) => {
                      validActions.push(action);
                    });
                  }
                );
              }
            });
          } catch (e) {
            log(
              `⚠️  Could not fetch routes dynamically, using content types directly`
            );

            // Fallback: scan content types manually
            const allContentTypes = Object.keys(strapi.contentTypes || {});
            const appContentTypes = allContentTypes.filter((ct) =>
              ct.startsWith("api::")
            );

            log(`Found ${appContentTypes.length} application content types`);

            validActions = appContentTypes.flatMap((ct) => [
              `${ct}.find`,
              `${ct}.findOne`,
            ]);
          }

          // Grant permissions for each valid action
          let grantedCount = 0;
          for (const action of validActions) {
            try {
              const existing = await strapi
                .query("plugin::users-permissions.permission")
                .findOne({
                  where: {
                    action: action,
                    role: publicRole.id,
                  },
                });

              if (!existing) {
                await strapi
                  .query("plugin::users-permissions.permission")
                  .create({
                    data: {
                      action: action,
                      role: publicRole.id,
                      enabled: true,
                    },
                  });
                grantedCount++;
                log(`✅ Granted: ${action}`);
              } else if (!existing.enabled) {
                await strapi
                  .query("plugin::users-permissions.permission")
                  .update({
                    where: { id: existing.id },
                    data: { enabled: true },
                  });
                grantedCount++;
                log(`✅ Enabled: ${action}`);
              }
            } catch (err) {
              // Skip invalid actions silently
            }
          }

          // Publish homepage if not published
          try {
            const hp = await strapi
              .documents("api::homepage.homepage")
              .findFirst();
            if (hp && !hp.publishedAt) {
              await strapi.documents("api::homepage.homepage").update({
                documentId: hp.documentId,
                data: { publishedAt: new Date() },
              });
              log("✅ Homepage auto-published");
            }
          } catch (e) {
            log(`⚠️  Homepage publish attempt: ${e.message}`);
          }

          log(
            `🎉 Permission setup complete (${grantedCount} actions granted)\n`
          );
        } catch (e) {
          log(`❌ Permission setup error: ${e.message}`);
        }
      }, 10000);
    } catch (e) {
      // swallow to avoid blocking bootstrap
    }
  },
};
