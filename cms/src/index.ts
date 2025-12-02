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
      // Force temp directories to project-local to avoid Windows EPERM in OS temp
      try {
        const fs = require("fs");
        const path = require("path");
        const tmpBase = path.join(process.cwd(), ".tmp", "uploads", "tmp");
        if (!fs.existsSync(tmpBase)) {
          fs.mkdirSync(tmpBase, { recursive: true });
        }
        process.env.TMPDIR = tmpBase;
        process.env.TEMP = tmpBase;
        process.env.TMP = tmpBase;
      } catch (_) {
        // ignore temp dir setup errors
      }

      // Force OS temp dir to a project-local path to avoid Windows EPERM locks
      const fs = require("fs");
      const path = require("path");
      const localTmp = path.join(process.cwd(), ".tmp", "uploads", "tmp");
      try {
        fs.mkdirSync(localTmp, { recursive: true });
      } catch (_) {}
      process.env.TMPDIR = localTmp;
      process.env.TMP = localTmp;
      process.env.TEMP = localTmp;
      process.env.STRAPI_UPLOAD_TMP_DIR = localTmp;

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

      // Ensure About/Contact exist and are published; grant Public read permissions
      try {
        // Create and publish single-type entries if missing
        const ensureSingle = async (
          uid: string,
          defaults: Record<string, any>
        ) => {
          const existing = await strapi.entityService.findMany(uid, {
            publicationState: "preview",
            populate: [],
          });
          if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            await strapi.entityService.create(uid, {
              data: { ...defaults, publishedAt: new Date() },
            });
          } else {
            const entry = Array.isArray(existing) ? existing[0] : existing;
            if (!entry.publishedAt) {
              await strapi.entityService.update(uid, entry.id, {
                data: { publishedAt: new Date() },
              });
            }
          }
        };

        await ensureSingle("api::about.about", { title: "Despre noi" });
        await ensureSingle("api::contact.contact", { title: "Contact" });

        // Grant Public role read permission for single types
        const publicRole = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({ where: { type: "public" } });
        if (publicRole) {
          const ensurePermission = async (action: string) => {
            const existingPerm = await strapi.db
              .query("plugin::users-permissions.permission")
              .findOne({
                where: { role: publicRole.id, action },
              });
            if (!existingPerm) {
              await strapi.db
                .query("plugin::users-permissions.permission")
                .create({
                  data: { role: publicRole.id, action, enabled: true },
                });
            } else if (!existingPerm.enabled) {
              await strapi.db
                .query("plugin::users-permissions.permission")
                .update({
                  where: { id: existingPerm.id },
                  data: { enabled: true },
                });
            }
          };

          await ensurePermission("api::about.about.find");
          await ensurePermission("api::contact.contact.find");
        }
      } catch (permErr) {
        const errLog =
          strapi && strapi.log && strapi.log.warn
            ? strapi.log.warn.bind(strapi.log)
            : console.warn;
        errLog(
          `Bootstrap permission setup warning: ${
            (permErr && permErr.message) || String(permErr)
          }`
        );
      }
    } catch (e) {
      // swallow to avoid blocking bootstrap
    }
  },
};
