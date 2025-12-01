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
        // Provide a minimal env accessor compatible with Strapi's env helper
        const envHelper: any = (k: string, d?: any) => process.env[k] ?? d;
        envHelper.int = (key: string, def?: number) => {
          const v = process.env[key];
          const n = v !== undefined ? parseInt(v, 10) : NaN;
          return Number.isNaN(n) ? (def as any) : n;
        };
        envHelper.bool = (key: string, def?: boolean) => {
          const v = (process.env[key] || "").toString().toLowerCase();
          if (v === "true" || v === "1") return true;
          if (v === "false" || v === "0") return false;
          return def as any;
        };
        envHelper.array = (key: string, def?: string[]) => {
          const v = process.env[key];
          return v
            ? v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : (def as any);
        };
        const dbCfg = dbModule({ env: envHelper });
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

      // Bootstrap clean - no automatic permission manipulation
      // This avoids interfering with users-permissions plugin route detection
      // Manage all permissions manually from Admin UI: Settings → Roles → Public
    } catch (e) {
      // swallow to avoid blocking bootstrap
    }
  },
};
