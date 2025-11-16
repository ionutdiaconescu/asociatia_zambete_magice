/**
 * Production State Diagnostic Script
 * Run this on Render to check why endpoints return 404
 */

const Strapi = require("@strapi/strapi");

async function checkProductionState() {
  console.log("🔍 Checking production state...\n");

  const app = await Strapi().load();

  try {
    console.log("1️⃣ Checking Content Types:");
    const contentTypes = Object.keys(strapi.contentTypes);
    const appTypes = contentTypes.filter((ct) => ct.startsWith("api::"));
    console.log(`   Found ${appTypes.length} application content types:`);
    appTypes.forEach((ct) => console.log(`   - ${ct}`));

    console.log("\n2️⃣ Checking Homepage Entry:");
    const homepage = await strapi
      .documents("api::homepage.homepage")
      .findFirst();
    if (homepage) {
      console.log(
        `   ✅ Homepage exists (ID: ${homepage.id}, publishedAt: ${homepage.publishedAt})`
      );
    } else {
      console.log("   ❌ Homepage entry NOT FOUND");
    }

    console.log("\n3️⃣ Checking Campaigns:");
    const campaigns = await strapi
      .documents("api::campanie-de-donatii.campanie-de-donatii")
      .findMany({ limit: 5 });
    console.log(`   Found ${campaigns.length} campaigns`);
    if (campaigns.length > 0) {
      campaigns.forEach((c) =>
        console.log(`   - ${c.title} (published: ${!!c.publishedAt})`)
      );
    }

    console.log("\n4️⃣ Checking Public Role Permissions:");
    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "public" },
        populate: ["permissions"],
      });

    if (publicRole) {
      const relevantPerms = publicRole.permissions.filter(
        (p) =>
          p.action.includes("homepage") ||
          p.action.includes("campanie-de-donatii")
      );
      console.log(
        `   Public role has ${relevantPerms.length} relevant permissions:`
      );
      relevantPerms.forEach((p) =>
        console.log(`   - ${p.action} (enabled: ${p.enabled})`)
      );
    } else {
      console.log("   ❌ Public role NOT FOUND");
    }

    console.log("\n5️⃣ Testing Direct Query:");
    try {
      const directHomepage = await strapi.entityService.findMany(
        "api::homepage.homepage",
        {
          publicationState: "live",
        }
      );
      console.log(
        `   Direct query result:`,
        directHomepage ? "✅ Found" : "❌ Not found"
      );
    } catch (e) {
      console.log(`   ❌ Direct query error: ${e.message}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await app.destroy();
  }
}

checkProductionState();
