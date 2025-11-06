// Script pentru verificarea și repararea rolurilor admin
const { createStrapi } = require("@strapi/strapi");

(async () => {
  console.log("[admin-roles] Starting admin roles verification...");

  const strapi = await createStrapi();
  await strapi.start();

  try {
    // 1. Verifică toți userii admin
    console.log("\n1. VERIFICARE USERI ADMIN:");
    const adminUsers = await strapi.db.query("admin::user").findMany({
      populate: ["roles"],
    });

    console.log(`Găsit ${adminUsers.length} admin users:`);
    adminUsers.forEach((user) => {
      console.log(
        `- ID: ${user.id}, Email: ${user.email}, Active: ${!user.blocked}`
      );
      console.log(
        `  Roles: ${user.roles?.map((r) => r.name || r.code).join(", ") || "NONE"}`
      );
    });

    // 2. Verifică rolurile disponibile
    console.log("\n2. VERIFICARE ROLURI ADMIN:");
    const adminRoles = await strapi.db.query("admin::role").findMany({
      populate: ["permissions"],
    });

    console.log(`Găsit ${adminRoles.length} admin roles:`);
    adminRoles.forEach((role) => {
      console.log(`- ID: ${role.id}, Code: ${role.code}, Name: ${role.name}`);
      console.log(
        `  Permissions: ${role.permissions?.length || 0} permissions`
      );
    });

    // 3. Găsește rolul Super Admin
    const superAdminRole = adminRoles.find(
      (role) =>
        role.code === "strapi-super-admin" || role.name === "Super Admin"
    );

    if (!superAdminRole) {
      console.log("\n❌ SUPER ADMIN ROLE NU EXISTĂ!");
      return;
    }

    console.log(`\n✅ Super Admin Role găsit: ID ${superAdminRole.id}`);

    // 4. Verifică dacă adminul activ are Super Admin role
    const activeAdmins = adminUsers.filter((user) => !user.blocked);

    for (const admin of activeAdmins) {
      const hasuperAdminRole = admin.roles?.some(
        (role) =>
          role.id === superAdminRole.id || role.code === "strapi-super-admin"
      );

      if (!hasuperAdminRole) {
        console.log(
          `\n🔧 REPARARE: Adaug Super Admin role pentru ${admin.email}`
        );

        // Adaugă Super Admin role
        await strapi.db.query("admin::user").update({
          where: { id: admin.id },
          data: {
            roles: [superAdminRole.id],
          },
        });

        console.log(`✅ Super Admin role adăugat pentru ${admin.email}`);
      } else {
        console.log(`✅ ${admin.email} are deja Super Admin role`);
      }
    }

    // 5. Verifică permisiunile Super Admin
    console.log(`\n3. VERIFICARE PERMISIUNI SUPER ADMIN:`);
    console.log(
      `Super Admin are ${superAdminRole.permissions?.length || 0} permisiuni`
    );

    // Căutăm permisiuni specifice
    const criticalPermissions = [
      "admin::content-manager",
      "admin::upload",
      "admin::content-type-builder",
    ];

    criticalPermissions.forEach((permission) => {
      const hasPermission = superAdminRole.permissions?.some(
        (p) => p.action?.includes(permission) || p.subject?.includes(permission)
      );
      console.log(`- ${permission}: ${hasPermission ? "✅" : "❌"}`);
    });

    console.log("\n✅ Admin roles verification complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await strapi.destroy();
  }
})();
