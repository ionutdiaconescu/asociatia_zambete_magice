const { createStrapi } = require("@strapi/strapi");

async function dedupPermissionsV2() {
  const app = await createStrapi().load();
  try {
    const perms = await app.entityService.findMany("admin::permission", {
      populate: ["role"],
      limit: -1,
    });
    console.log(`Total admin::permission records: ${perms.length}`);

    const groups = new Map();
    for (const p of perms) {
      const roleId = p.role && p.role.id ? p.role.id : p.role || "no-role";
      const key = `${p.action}::${roleId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p.id);
    }

    let totalDeleted = 0;
    for (const [key, ids] of groups) {
      if (ids.length <= 1) continue;
      const numericIds = ids
        .map((i) => Number(i))
        .filter((n) => !Number.isNaN(n));
      numericIds.sort((a, b) => a - b);
      const keep = numericIds[0];
      const toDelete = numericIds.slice(1);
      for (const id of toDelete) {
        try {
          await app.entityService.delete("admin::permission", id);
          console.log(`Deleted duplicate id:${id} for key:${key}`);
          totalDeleted++;
        } catch (err) {
          console.error(`Failed to delete id:${id}: ${err.message}`);
        }
      }
    }

    console.log(`Dedup V2 complete. Deleted ${totalDeleted} records.`);
    await app.destroy();
  } catch (err) {
    console.error("Error during dedup V2:", err.message);
    await app.destroy();
  }
}

if (require.main === module) dedupPermissionsV2();

module.exports = dedupPermissionsV2;
