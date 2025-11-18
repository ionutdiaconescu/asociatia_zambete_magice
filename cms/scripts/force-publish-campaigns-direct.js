#!/usr/bin/env node
"use strict";
// Directly set publishedAt on any campaign lacking it (bypasses document publish if it fails)
const { createStrapi } = require("@strapi/strapi");
(async () => {
  const strapi = await createStrapi();
  await strapi.start();
  try {
    const uid = "api::campaign.campaign";
    const drafts = await strapi.entityService.findMany(uid, {
      fields: ["id", "title", "publishedAt"],
      sort: { id: "asc" },
      limit: 100,
    });
    const toSet = drafts.filter((c) => !c.publishedAt);
    if (!toSet.length) {
      console.log("All campaigns already have publishedAt.");
    }
    for (const c of toSet) {
      process.stdout.write(
        `Force setting publishedAt for #${c.id} (${c.title}) ... `
      );
      try {
        await strapi.entityService.update(uid, c.id, {
          data: { publishedAt: new Date().toISOString() },
        });
        console.log("OK");
      } catch (e) {
        console.log("FAIL:", e.message);
      }
    }
  } catch (err) {
    console.error("force-publish error:", err.message);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
