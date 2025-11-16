"use strict";

/**
 * Grant Public role permissions for frontend API access.
 * Run: node scripts/grant-public-permissions.js
 */

const { createStrapi } = require("@strapi/strapi");
const path = require("path");

async function run() {
  console.log("[grant-public] Starting Strapi...");
  const strapi = await createStrapi({
    env: "development",
    distDir: path.join(__dirname, "../dist"),
    dir: path.join(__dirname, ".."),
  });

  await strapi.start();

  try {
    // Find Public role
    const publicRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });

    if (!publicRole) {
      console.error("[grant-public] Public role not found!");
      return;
    }

    console.log(`[grant-public] Found Public role (id=${publicRole.id})`);

    // Define API permissions to grant: find and findOne for content types
    const permissionsToGrant = [
      {
        action: "api::homepage.homepage.find",
        actionParameters: {},
      },
      {
        action: "api::homepage.homepage.findOne",
        actionParameters: {},
      },
      {
        action: "api::campanie-de-donatii.campanie-de-donatii.find",
        actionParameters: {},
      },
      {
        action: "api::campanie-de-donatii.campanie-de-donatii.findOne",
        actionParameters: {},
      },
    ];

    for (const perm of permissionsToGrant) {
      // Check if permission already exists
      const existing = await strapi.db
        .query("plugin::users-permissions.permission")
        .findOne({ where: { action: perm.action, role: publicRole.id } });

      if (existing) {
        console.log(`[grant-public] Permission already exists: ${perm.action}`);
        continue;
      }

      // Create permission
      await strapi.db.query("plugin::users-permissions.permission").create({
        data: {
          action: perm.action,
          actionParameters: perm.actionParameters,
          role: publicRole.id,
        },
      });
      console.log(`[grant-public] ✅ Granted: ${perm.action}`);
    }

    console.log("[grant-public] Done! Public role permissions updated.");
  } catch (err) {
    console.error("[grant-public] Error:", err);
  } finally {
    await strapi.destroy();
  }
}

run();
