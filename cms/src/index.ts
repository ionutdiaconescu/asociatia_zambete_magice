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

      // Temporary diagnostic - check state on startup
      setTimeout(async () => {
        try {
          log("\n🔍 === DIAGNOSTIC START ===");

          // Check content types
          const cts = Object.keys(strapi.contentTypes || {}).filter((ct) =>
            ct.startsWith("api::")
          );
          log(`Content Types: ${cts.join(", ") || "NONE"}`);

          // Check homepage
          try {
            const hp = await strapi
              .documents("api::homepage.homepage")
              .findFirst();
            log(
              `Homepage: ${hp ? `ID ${hp.id}, published=${!!hp.publishedAt}` : "NOT FOUND"}`
            );
          } catch (e) {
            log(`Homepage error: ${e.message}`);
          }

          // Check permissions
          try {
            const role = await strapi
              .query("plugin::users-permissions.role")
              .findOne({
                where: { type: "public" },
                populate: ["permissions"],
              });
            const perms =
              role?.permissions?.filter(
                (p) =>
                  p.action.includes("homepage") || p.action.includes("campanie")
              ) || [];
            log(
              `Public permissions: ${perms.length} (${perms.map((p) => p.action).join(", ")})`
            );
          } catch (e) {
            log(`Permission check error: ${e.message}`);
          }

          log("=== DIAGNOSTIC END ===\n");
        } catch (e) {
          // silent
        }
      }, 5000);
    } catch (e) {
      // swallow to avoid blocking bootstrap
    }
  },
};
