// import type { Core } from '@strapi/strapi';

function getLogger(strapi: any, level: "info" | "warn" | "error") {
  const logger = strapi && strapi.log ? strapi.log : null;
  const fallback =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;
  return logger && typeof logger[level] === "function"
    ? logger[level].bind(logger)
    : fallback;
}

function applyTempEnvironment(tmpDir: string) {
  process.env.TMPDIR = tmpDir;
  process.env.TMP = tmpDir;
  process.env.TEMP = tmpDir;
  process.env.STRAPI_UPLOAD_TMP_DIR = tmpDir;
}

function ensureUploadTmpDir() {
  const fs = require("fs");
  const path = require("path");
  const localTmp = path.join(process.cwd(), ".tmp", "uploads", "tmp");
  fs.mkdirSync(localTmp, { recursive: true });
  applyTempEnvironment(localTmp);
  return localTmp;
}

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
      try {
        ensureUploadTmpDir();
      } catch (_) {}

      // Upload plugin settings are stored in DB and can override config/plugins.js.
      // Force safe defaults to avoid image optimization temp-file locking on Windows.
      try {
        const uploadStore = strapi.store({
          type: "plugin",
          name: "upload",
          key: "settings",
        });
        const currentUploadSettings =
          (await uploadStore.get()) || ({} as Record<string, any>);
        const desiredUploadSettings = {
          ...currentUploadSettings,
          sizeOptimization: false,
          responsiveDimensions: false,
          autoOrientation: false,
          aiMetadata: false,
        };

        const changed =
          currentUploadSettings.sizeOptimization !== false ||
          currentUploadSettings.responsiveDimensions !== false ||
          currentUploadSettings.autoOrientation !== false ||
          currentUploadSettings.aiMetadata !== false;

        if (changed) {
          await uploadStore.set({ value: desiredUploadSettings });
          const infoLog = getLogger(strapi, "info");
          infoLog(
            "[upload-settings] Forced safe upload settings in plugin store",
          );
        }
      } catch (uploadErr) {
        const warnLog = getLogger(strapi, "warn");
        warnLog(
          `[upload-settings] Could not enforce upload settings: ${
            (uploadErr && (uploadErr as any).message) || String(uploadErr)
          }`,
        );
      }

      const id = process.env.WRAPPER_SENTINEL_ID || "<none>";
      const log = getLogger(strapi, "info");
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
          const errLog = getLogger(strapi, "error");
          errLog(
            `[strapi-sentinel] failed to evaluate DB config: ${e && e.message ? e.message : String(e)}`,
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
          defaults: Record<string, any>,
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
        const errLog = getLogger(strapi, "warn");
        errLog(
          `Bootstrap permission setup warning: ${
            (permErr && permErr.message) || String(permErr)
          }`,
        );
      }
    } catch (e) {
      // swallow to avoid blocking bootstrap
    }
  },
};
