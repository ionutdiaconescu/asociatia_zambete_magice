/* Diagnose publishing issues for campaign entries */
require("dotenv").config();
const { createStrapi } = require("@strapi/strapi");

(async () => {
  const strapi = await createStrapi();
  await strapi.start();
  try {
    const uid = "api::campaign.campaign";
    // Fetch all campaigns including unpublished ones
    const all = await strapi.entityService.findMany(uid, {
      filters: {},
      publicationState: "preview", // include drafts
      fields: [
        "id",
        "title",
        "slug",
        "status",
        "publishedAt",
        "goal",
        "raised",
      ],
      sort: { id: "asc" },
      limit: 100,
    });

    console.log(`Total campaigns (including drafts): ${all.length}`);
    if (!all.length) {
      console.log("No campaigns found. Create one in Admin and retry.");
      return;
    }

    const problems = [];

    for (const c of all) {
      const infoPrefix = `Campaign#${c.id} '${c.title || "<no-title>"}'`;
      if (c.publishedAt) {
        console.log(`${infoPrefix} already published at ${c.publishedAt}`);
        continue;
      }
      console.log(`${infoPrefix} is draft -> attempting publish...`);
      try {
        // Attempt publish: update with publishedAt
        const updated = await strapi.entityService.update(uid, c.id, {
          data: { publishedAt: new Date(), status: c.status || "active" },
        });
        if (updated.publishedAt) {
          console.log(`  ✅ Published (publishedAt=${updated.publishedAt})`);
        } else {
          console.log("  ⚠️ Update succeeded but publishedAt still missing");
          problems.push({ id: c.id, reason: "No publishedAt after update" });
        }
      } catch (e) {
        console.log(`  ❌ Publish failed: ${e.message}`);
        // Capture validation errors if present
        const details = e?.details || e?.error || null;
        problems.push({ id: c.id, reason: e.message, details });
      }
    }

    if (problems.length) {
      console.log("\n=== Problems Summary ===");
      for (const p of problems) {
        console.log(`ID ${p.id}: ${p.reason}`);
        if (p.details) console.log("  details:", JSON.stringify(p.details));
      }
    } else {
      console.log(
        "\nAll draft campaigns published successfully or none needed."
      );
    }

    // Field shape check: read a sample to ensure attributes exist
    const modelDef = strapi.contentTypes[uid];
    if (modelDef) {
      console.log("\nModel attributes:", Object.keys(modelDef.attributes));
    } else {
      console.log("\n⚠️ Cannot load model definition for campaigns");
    }
  } catch (err) {
    console.error("Diagnostics script error:", err.message);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
