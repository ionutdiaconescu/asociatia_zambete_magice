const { createStrapi } = require("@strapi/strapi");

async function cleanupPermissions() {
  const app = await createStrapi().load();
  try {
    const perms = await app.entityService.findMany("admin::permission", {
      populate: ["role"],
      limit: -1,
    });
    console.log(`[CLEANUP] Total admin::permission records: ${perms.length}`);

    // Group by action+roleId
    const groups = new Map();
    for (const p of perms) {
      const roleId = p.role && p.role.id ? p.role.id : p.role || "no-role";
      const key = `${p.action}::${roleId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p.id);
    }

    // Delete all except the first (minimum) id per group
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
          totalDeleted++;
        } catch (err) {
          // Ignore delete errors
        }
      }
    }

    if (totalDeleted > 0) {
      console.log(
        `[CLEANUP] Deleted ${totalDeleted} duplicate permission records`
      );
    } else {
      console.log(`[CLEANUP] No duplicate permissions found`);
    }

    await app.destroy();
  } catch (err) {
    console.error("[CLEANUP] Error:", err.message);
    await app.destroy();
  }
}

if (require.main === module) cleanupPermissions();

module.exports = cleanupPermissions;
