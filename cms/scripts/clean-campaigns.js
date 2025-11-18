#!/usr/bin/env node
"use strict";
// Clean duplicate / corrupted campaign rows: backup then rebuild single published campaign.
// Usage:
//   node scripts/clean-campaigns.js          (dry-run only)
//   node scripts/clean-campaigns.js --apply  (perform cleanup)
//
// Steps (when --apply):
//  1. Backup all existing rows to backups/campaigns-backup-<timestamp>.json
//  2. Choose canonical row (prefer with non-empty title; if multiple pick latest updated)
//  3. Delete all rows from campaigns table
//  4. Recreate canonical row via entityService.create (ensuring publishedAt)
//  5. Log final state

const { createStrapi } = require("@strapi/strapi");

(async () => {
  const apply = process.argv.includes("--apply");
  const strapi = await createStrapi();
  await strapi.start();
  try {
    const knex = strapi.db.connection;
    const rows = await knex("campaigns")
      .select("*")
      .orderBy("updated_at", "desc");
    console.log(`Found ${rows.length} raw row(s) in campaigns table.`);
    rows.forEach((r) =>
      console.log(
        `Row id=${r.id} title=${JSON.stringify(r.title)} slug=${r.slug} published_at=${r.published_at}`
      )
    );

    if (!apply) {
      console.log("\nDry-run: no changes made. Re-run with --apply to clean.");
      return;
    }
    if (!rows.length) {
      console.log("Nothing to clean; table empty.");
      return;
    }
    // Backup
    const fs = require("fs");
    const path = require("path");
    const backupPath = path.join(
      __dirname,
      "..",
      "backups",
      `campaigns-backup-${new Date().toISOString().replace(/[:]/g, "-")}.json`
    );
    fs.writeFileSync(backupPath, JSON.stringify(rows, null, 2));
    console.log("Backup written to", backupPath);

    // Pick canonical row
    let canonical = rows.find((r) => r.title && r.title.trim()) || rows[0];
    console.log("Canonical chosen row id=", canonical.id);

    // Delete all rows
    await knex("campaigns").del();
    console.log("All rows deleted.");

    // Recreate minimal published row
    const data = {
      title: canonical.title || "Campanie",
      slug:
        canonical.slug && canonical.slug !== "" ? canonical.slug : "campanie",
      shortDescription:
        canonical.short_description || canonical.shortDescription || "",
      body: canonical.body || "",
      goal: canonical.goal || 0,
      raised: canonical.raised || 0,
      isFeatured: canonical.is_featured || canonical.isFeatured || false,
      startDate: canonical.start_date || canonical.startDate || null,
      endDate: canonical.end_date || canonical.endDate || null,
      donorCount: canonical.donor_count || canonical.donorCount || 0,
      daysLeft: canonical.days_left || canonical.daysLeft || 0,
      publishedAt: new Date().toISOString(),
    };
    const created = await strapi.entityService.create(
      "api::campaign.campaign",
      { data }
    );
    console.log("Recreated campaign id=", created.id, "slug=", created.slug);
  } catch (e) {
    console.error("clean-campaigns error:", e.message);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
