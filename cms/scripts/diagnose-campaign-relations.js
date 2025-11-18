#!/usr/bin/env node
"use strict";
// Inspect foreign keys referencing the campaigns table and basic row counts
(async () => {
  const strapiFactory = require("@strapi/strapi");
  const app = await strapiFactory.createStrapi();
  await app.load();
  await app.start();
  try {
    const knex = strapi.db.connection;
    // Adjust table name if Strapi prefixing exists; usually it's just the collection name pluralized
    const campaignTable = "campaigns";
    console.log("Inspecting FK constraints referencing table:", campaignTable);
    const fkQuery = `SELECT
        tc.constraint_name,
        tc.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS target_table,
        ccu.column_name AS target_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = ?
      ORDER BY source_table, source_column;`;
    const fks = await knex.raw(fkQuery, [campaignTable]);
    const rows = fks.rows || fks; // pg vs sqlite fallback
    if (!rows.length) {
      console.log(
        "No foreign keys found referencing campaigns (expected if donations not yet modeled)."
      );
    } else {
      console.log("Foreign keys referencing campaigns:");
      rows.forEach((r) =>
        console.log(
          `${r.source_table}.${r.source_column} -> ${r.target_table}.${r.target_column} (${r.constraint_name})`
        )
      );
    }
    // Row count sanity checks
    const countCampaigns = await knex(campaignTable).count("* as count");
    console.log(
      "Campaigns count:",
      countCampaigns[0]?.count || JSON.stringify(countCampaigns)
    );
    // Try common donation table names
    const donationTables = [
      "donations",
      "donatii",
      "transaction",
      "transactions",
    ];
    for (const t of donationTables) {
      const exists = await knex.schema.hasTable(t);
      if (exists) {
        const cnt = await knex(t).count("* as count");
        console.log(`Table ${t} exists. Row count=${cnt[0]?.count}`);
      }
    }
  } catch (err) {
    console.error("Error diagnosing campaign relations:", err);
  } finally {
    await strapi.destroy();
  }
})();
