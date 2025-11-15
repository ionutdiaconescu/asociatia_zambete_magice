const { createStrapi } = require("@strapi/strapi");

async function dedupPermissions() {
  const app = await createStrapi().load();
  try {
    const perms = await app.entityService.findMany("admin::permission", {
      populate: ["role"],
    });
    console.log(`Total admin::permission records: ${perms.length}`);

    const keep = new Map();
    const toDelete = [];

    for (const p of perms) {
      const roleId = p.role && p.role.id ? p.role.id : p.role || "no-role";
      const key = `${p.action}::${roleId}`;
      if (!keep.has(key)) {
        keep.set(key, p);
      } else {
        toDelete.push(p);
      }
    }

    console.log(
      `Found ${toDelete.length} duplicate permission records to delete.`
    );
    for (const d of toDelete) {
      console.log(
        `Deleting id:${d.id} action:${d.action} role:${d.role && d.role.id}`
      );
      await app.entityService.delete("admin::permission", d.id);
    }

    console.log("Deduplication complete.");
    await app.destroy();
  } catch (err) {
    console.error("Error during deduplication:", err.message);
    await app.destroy();
  }
}

if (require.main === module) dedupPermissions();
module.exports = dedupPermissions;
