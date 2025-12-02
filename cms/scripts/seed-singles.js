// Create and publish single-type entries for About and Contact, and grant Public read permissions
const { createStrapi } = require("@strapi/strapi");

async function ensureSingle(strapi, uid, defaults) {
  // For single types, findMany may return an array with zero/one entries
  let existing = await strapi.entityService.findMany(uid, { publicationState: "preview" });
  if (Array.isArray(existing)) existing = existing[0];
  if (!existing) {
    await strapi.entityService.create(uid, {
      data: { ...defaults, publishedAt: new Date() },
    });
  } else if (!existing.publishedAt) {
    await strapi.entityService.update(uid, existing.id, {
      data: { publishedAt: new Date() },
    });
  }
}

async function ensurePublicFind(strapi, action) {
  const publicRole = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });
  if (!publicRole) return;
  const existingPerm = await strapi.db
    .query("plugin::users-permissions.permission")
    .findOne({ where: { role: publicRole.id, action } });
  if (!existingPerm) {
    await strapi.db
      .query("plugin::users-permissions.permission")
      .create({ data: { role: publicRole.id, action, enabled: true } });
  } else if (!existingPerm.enabled) {
    await strapi.db
      .query("plugin::users-permissions.permission")
      .update({ where: { id: existingPerm.id }, data: { enabled: true } });
  }
}

(async () => {
  const app = await createStrapi().load();
  try {
    await ensureSingle(app, "api::about.about", { title: "Despre noi" });
    await ensureSingle(app, "api::contact.contact", { title: "Contact" });
    await ensurePublicFind(app, "api::about.about.find");
    await ensurePublicFind(app, "api::contact.contact.find");
    console.log("Seed OK: singles ensured and permissions set.");
  } catch (e) {
    console.error("Seed error:", e && e.message ? e.message : e);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
