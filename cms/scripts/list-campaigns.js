#!/usr/bin/env node
"use strict";
(async () => {
  const strapiFactory = require("@strapi/strapi");
  const app = await strapiFactory.createStrapi();
  await app.load();
  await app.start();
  try {
    const campaigns = await strapi.entityService.findMany(
      "api::campaign.campaign",
      {
        fields: [
          "id",
          "title",
          "slug",
          "publishedAt",
          "createdAt",
          "updatedAt",
        ],
        sort: { createdAt: "desc" },
      }
    );
    console.log(`Found ${campaigns.length} campaign(s)`);
    campaigns.forEach((c) => {
      console.log(
        `#${c.id} title="${c.title}" slug="${c.slug}" publishedAt=${c.publishedAt || "NULL"}`
      );
    });
    if (!campaigns.length) {
      console.log("No campaigns found. Create one in the admin UI.");
    }
  } catch (err) {
    console.error("Error listing campaigns:", err);
  } finally {
    await strapi.destroy();
  }
})();
