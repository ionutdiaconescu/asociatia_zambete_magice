#!/usr/bin/env node
"use strict";
// Raw DB publish: set published_at for campaigns rows missing it.
const { createStrapi } = require("@strapi/strapi");
(async () => {
  const strapi = await createStrapi();
  await strapi.start();
  try {
    const knex = strapi.db.connection;
    const rows = await knex("campaigns").whereNull("published_at");
    if (!rows.length) {
      console.log("No campaign rows with NULL published_at.");
    } else {
      console.log(`Found ${rows.length} draft row(s). Updating...`);
      const now = new Date().toISOString();
      await knex("campaigns")
        .whereNull("published_at")
        .update({ published_at: now });
      console.log("Update done.");
    }
  } catch (e) {
    console.error("raw-publish error:", e.message);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
