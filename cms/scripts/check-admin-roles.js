const { createStrapi } = require("@strapi/strapi");

async function checkRoles() {
  const app = await createStrapi().load();
  try {
    const roles = await app.entityService.findMany("admin::role", {});
    console.log(`Total admin::role records: ${roles.length}`);
    const byName = new Map();
    const byCode = new Map();

    roles.forEach((r) => {
      const name = (r.name || "").toString().trim().toLowerCase();
      const code = (r.code || "").toString().trim().toLowerCase();

      if (!byName.has(name)) byName.set(name, []);
      byName.get(name).push(r);

      if (!byCode.has(code)) byCode.set(code, []);
      byCode.get(code).push(r);
    });

    let dupNameCount = 0;
    for (const [name, items] of byName) {
      if (name === "") continue;
      if (items.length > 1) {
        dupNameCount++;
        console.log(
          `\nDUPLICATE ROLE NAME: '${name}' -> ${items.length} records`
        );
        items.forEach((it) => {
          console.log(
            `  id:${it.id} name:'${it.name}' code:'${it.code}' description:'${it.description || ""}'`
          );
        });
      }
    }

    let dupCodeCount = 0;
    for (const [code, items] of byCode) {
      if (code === "") continue;
      if (items.length > 1) {
        dupCodeCount++;
        console.log(
          `\nDUPLICATE ROLE CODE: '${code}' -> ${items.length} records`
        );
        items.forEach((it) => {
          console.log(
            `  id:${it.id} name:'${it.name}' code:'${it.code}' description:'${it.description || ""}'`
          );
        });
      }
    }

    if (dupNameCount === 0 && dupCodeCount === 0)
      console.log("\nNo duplicate roles found by name or code.");

    await app.destroy();
  } catch (err) {
    console.error("Error checking roles:", err.message);
    await app.destroy();
  }
}

if (require.main === module) checkRoles();

module.exports = checkRoles;
