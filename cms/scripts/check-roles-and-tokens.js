#!/usr/bin/env node
"use strict";
// Diagnostic: list roles, permissions, admin users and api tokens
const { createStrapi } = require("@strapi/strapi");

async function run() {
  const app = await createStrapi().load();
  try {
    console.log("[diag] Fetching users-permissions roles...");
    const roles = await app.entityService.findMany(
      "plugin::users-permissions.role",
      { limit: -1 }
    );
    console.log(`[diag] Found ${roles.length} roles:`);
    for (const r of roles) {
      console.log(`  - id=${r.id} name='${r.name}' type='${r.type || ""}'`);
    }

    console.log("\n[diag] Fetching users-permissions permissions (count)...");
    const perms = await app.entityService.findMany(
      "plugin::users-permissions.permission",
      { limit: -1 }
    );
    console.log(`[diag] Total public plugin permissions: ${perms.length}`);

    // Show count of public role permissions specifically
    const publicRole = roles.find((x) => x.type === "public");
    if (publicRole) {
      const publicPerms = perms.filter(
        (p) =>
          Number(p.role) === Number(publicRole.id) ||
          (p.role && p.role.id === publicRole.id)
      );
      console.log(
        `[diag] Public role id=${publicRole.id} has ${publicPerms.length} permissions`
      );
    }

    // Admin roles (plugin-admin?) list admin::role and admin users
    console.log("\n[diag] Fetching admin roles and users...");
    const adminRoles = await app.entityService.findMany("admin::role", {
      limit: -1,
      populate: ["permissions"],
    });
    console.log(`[diag] Admin roles: ${adminRoles.length}`);
    for (const ar of adminRoles) {
      console.log(`  - id=${ar.id} name='${ar.name}' code='${ar.code || ""}'`);
    }

    const adminUsers = await app.entityService.findMany("admin::user", {
      limit: -1,
      populate: ["roles"],
    });
    console.log(`[diag] Admin users: ${adminUsers.length}`);
    for (const u of adminUsers) {
      const roleNames = (u.roles || []).map((r) => r.name).join(", ");
      console.log(
        `  - id=${u.id} email='${u.email}' isSuper=${!!u.superAdmin} roles=[${roleNames}]`
      );
    }

    console.log("\n[diag] Fetching admin API tokens...");
    const apiTokens = await app.entityService.findMany("admin::api-token", {
      limit: -1,
    });
    console.log(`[diag] Admin API tokens count: ${apiTokens.length}`);
    for (const t of apiTokens) {
      console.log(
        `  - id=${t.id} name='${t.name}' type=${t.type} lifespan=${t.lifespan}`
      );
    }

    console.log("\n[diag] Done.");
  } catch (e) {
    console.error("[diag] Error:", e && e.message ? e.message : e);
  } finally {
    await app.destroy();
  }
}

if (require.main === module) run();

module.exports = run;
