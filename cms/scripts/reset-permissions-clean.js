const { createStrapi } = require("@strapi/strapi");

async function resetPermissionsClean() {
  const app = await createStrapi().load();
  try {
    console.log("[RESET] Starting permission reset...");

    // Get all permissions
    const allPerms = await app.entityService.findMany("admin::permission", {
      limit: -1,
    });
    console.log(`[RESET] Found ${allPerms.length} total permission records`);

    // Group by action and get the MOST LEGITIMATE one (lowest ID, likely the original)
    const groups = new Map();
    for (const p of allPerms) {
      const action = p.action;
      if (!groups.has(action)) groups.set(action, []);
      groups.get(action).push(p);
    }

    let deletedCount = 0;
    for (const [action, perms] of groups) {
      // Sort by ID (lower ID = created earlier, likely correct)
      perms.sort((a, b) => a.id - b.id);

      // Keep only ONE per action (the first one - lowest ID, most authentic)
      const toKeep = perms[0];
      const toDelete = perms.slice(1);

      for (const p of toDelete) {
        try {
          await app.entityService.delete("admin::permission", p.id);
          console.log(`[RESET] Deleted id:${p.id} for action:${action}`);
          deletedCount++;
        } catch (err) {
          console.warn(`[RESET] Could not delete id:${p.id}: ${err.message}`);
        }
      }
    }

    console.log(`[RESET] Total deleted: ${deletedCount}`);
    console.log(
      "[RESET] Permissions reset complete. Restarting Strapi now recommended."
    );

    await app.destroy();
  } catch (err) {
    console.error("[RESET] Error:", err.message);
    await app.destroy();
  }
}

if (require.main === module) resetPermissionsClean();

module.exports = resetPermissionsClean;
