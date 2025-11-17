/*
 Reset Users-Permissions plugin permissions safely via Strapi ORM.
 This avoids raw table-name assumptions and lets Strapi rebuild on next start.
*/
require("dotenv").config();

const { createStrapi } = require("@strapi/strapi");

(async () => {
  const app = await createStrapi().load();
  try {
    const qp = app.db.query("plugin::users-permissions.permission");
    const beforeCount = await qp.count({ where: {} });
    await qp.deleteMany({ where: {} });
    const afterCount = await qp.count({ where: {} });
    console.log(
      `Users-Permissions: deleted ${beforeCount} permissions; ${afterCount} remain.`
    );

    // Best-effort cleanup of potential join table residue (will no-op if table names differ)
    try {
      await app.db.connection.raw(
        "TRUNCATE TABLE up_permissions RESTART IDENTITY CASCADE"
      );
      console.log("Truncated table up_permissions");
    } catch {}
    try {
      await app.db.connection.raw(
        "TRUNCATE TABLE up_permissions_role_lnk RESTART IDENTITY CASCADE"
      );
      console.log("Truncated table up_permissions_role_lnk");
    } catch {}

    console.log("Done. Restart Strapi to let permissions regenerate.");
  } catch (err) {
    console.error("Failed to reset permissions:", err);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
