/* Force publish all draft campaigns using Strapi document service */
require("dotenv").config();
const { createStrapi } = require("@strapi/strapi");

(async () => {
  const strapi = await createStrapi();
  await strapi.start();
  try {
    const uid = "api::campaign.campaign";
    const drafts = await strapi.documents(uid).findMany({
      filters: {},
      publicationState: "preview",
      limit: 100,
      sort: { id: "asc" },
    });
    console.log(
      `Found ${drafts.length} campaign documents (including drafts).`
    );
    const toPublish = drafts.filter((d) => !d.publishedAt);
    if (!toPublish.length) {
      console.log("No draft campaigns to publish.");
    }
    for (const doc of toPublish) {
      process.stdout.write(`Publishing campaign #${doc.id} ... `);
      try {
        await strapi.documents(uid).publish({ documentId: doc.id });
        console.log("OK");
      } catch (e) {
        console.log(`FAIL: ${e.message}`);
      }
    }
  } catch (err) {
    console.error("publish-campaigns error:", err.message);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
