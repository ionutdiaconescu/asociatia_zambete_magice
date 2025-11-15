const { createStrapi } = require("@strapi/strapi");

async function checkPermissions() {
  const app = await createStrapi().load();
  try {
    const perms = await app.entityService.findMany("admin::permission", {
      populate: ["role"],
    });
    console.log(`Total admin::permission records: ${perms.length}`);
    const map = new Map();
    perms.forEach((p) => {
      const key = p.action;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    let duplicated = 0;
    for (const [action, items] of map) {
      if (items.length > 1) {
        duplicated++;
        console.log(`\nDUPLICATE ACTION: ${action} -> ${items.length} records`);
        items.forEach((it) => {
          const roleObj = it.role;
          let roleInfo = "no-role";
          if (roleObj && typeof roleObj === "object") {
            roleInfo = `${roleObj.id || "?"}(${roleObj.name || "no-name"})`;
          } else if (roleObj) {
            roleInfo = String(roleObj);
          }
          console.log(`  id:${it.id} role:${roleInfo} enabled:${it.enabled}`);
        });
      }
    }
    if (duplicated === 0)
      console.log("\nNo duplicate permission actions found.");
    await app.destroy();
  } catch (err) {
    console.error("Error checking permissions:", err.message);
    await app.destroy();
  }
}

if (require.main === module) checkPermissions();

module.exports = checkPermissions;
