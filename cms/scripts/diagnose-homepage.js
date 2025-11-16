// Quick diagnostic script for homepage 404 issues
// Usage: node scripts/diagnose-homepage.js (after installing dependencies and having .env loaded)
// It will boot Strapi in minimal mode, read the homepage single type, and print publishedAt & permissions hints.

const { createStrapi } = require("@strapi/strapi");

async function run() {
  const strapi = await createStrapi({
    distDir: "dist",
  });
  await strapi.start();
  try {
    // Fetch single type homepage
    const uid = "api::homepage.homepage";
    const entries = await strapi.entityService.findMany(uid, { populate: "*" });
    const entry = Array.isArray(entries) ? entries[0] : entries;
    if (!entry) {
      console.log("❌ Homepage entry not found (uncreated).");
    } else {
      console.log("✅ Homepage entry found:");
      console.log({
        id: entry.id,
        publishedAt: entry.publishedAt,
        documentId: entry.documentId,
      });
      if (!entry.publishedAt) {
        console.log(
          "⚠️ Homepage is NOT published. Public requests will return 404 until you press Publish."
        );
      } else {
        console.log("✅ Homepage is published. 404 is not due to draft state.");
      }
    }

    // Verify public role permissions quickly
    const publicRole = await strapi.db
      .query("strapi::role")
      .findOne({ where: { type: "public" } });
    if (!publicRole) {
      console.log("❌ Public role missing.");
    } else {
      const perms = await strapi.db
        .query("strapi::permission")
        .findMany({ where: { role: publicRole.id } });
      const homepagePerms = perms.filter(
        (p) => p.action && p.action.includes("homepage")
      );
      const actions = homepagePerms.map((p) => p.action);
      console.log("🔎 Homepage permissions for Public role:", actions);
      const needs = [
        "api::homepage.homepage.find",
        "api::homepage.homepage.findOne",
      ];
      const missing = needs.filter((n) => !actions.includes(n));
      if (missing.length) {
        console.log("⚠️ Missing public permissions for homepage:", missing);
        console.log(
          "→ Add them in Admin > Settings > Roles & Permissions > Public."
        );
      } else {
        console.log("✅ Public role has homepage find/findOne permissions.");
      }
    }

    console.log("\nNext checks if still 404:");
    console.log(
      "- Confirm request URL exactly: https://asociatia-zambete-magice.onrender.com/api/homepage?populate=*"
    );
    console.log("- Ensure no proxy / CDN stripping /api path.");
    console.log(
      "- Try curl without cache: curl -v https://asociatia-zambete-magice.onrender.com/api/homepage"
    );
  } catch (err) {
    console.error("❌ Diagnostic error:", err);
  } finally {
    await strapi.destroy();
  }
}

run();
