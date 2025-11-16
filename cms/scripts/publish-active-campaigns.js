#!/usr/bin/env node
"use strict";
// Script: publish-active-campaigns.js
// Finds campaigns with status='active' but not published and publishes them by setting publishedAt
const { createStrapi } = require("@strapi/strapi");

async function publishActive() {
  const app = await createStrapi().load();
  try {
    console.log(
      "[publish-active] Searching for active campaigns without publishedAt..."
    );
    const campaigns = await app.entityService.findMany(
      "api::campaign.campaign",
      {
        filters: { status: "active", publishedAt: null },
        limit: -1,
      }
    );

    if (!campaigns || campaigns.length === 0) {
      console.log("[publish-active] No active unpublished campaigns found.");
      // Let the finally block handle shutdown
      return;
    }

    console.log(
      `[publish-active] Found ${campaigns.length} campaign(s) to publish.`
    );
    let published = 0;
    for (const c of campaigns) {
      try {
        await app.entityService.update("api::campaign.campaign", c.id, {
          data: { publishedAt: new Date().toISOString() },
        });
        console.log(
          `[publish-active] Published campaign id=${c.id} title="${c.title || ""}"`
        );
        published++;
      } catch (e) {
        console.error(
          `[publish-active] Failed to publish id=${c.id}:`,
          e.message || e
        );
      }
    }

    console.log(
      `[publish-active] Done. Published: ${published}/${campaigns.length}`
    );
  } catch (err) {
    console.error("[publish-active] Error:", err.message || err);
  } finally {
    await app.destroy();
  }
}

if (require.main === module) {
  publishActive();
}

module.exports = publishActive;
