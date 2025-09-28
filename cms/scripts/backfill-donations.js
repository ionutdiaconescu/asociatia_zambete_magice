// Ensure TypeScript config files (.ts in /config) can be required when running this script directly with node.
// We register ts-node on the fly if available.
try {
  require("ts-node").register({
    transpileOnly: true,
    compilerOptions: { module: "commonjs" },
  });
} catch (e) {
  console.warn(
    "[backfill] ts-node not found; make sure configs are compiled if this fails to load .ts files."
  );
}
/*
 Backfill script for donations & campaigns.
 Usage:
   node scripts/backfill-donations.js          # executes updates
   node scripts/backfill-donations.js --dry    # only logs (no DB writes)

 Steps:
 1. For each donation: if amountInMinorUnit is null/undefined and suma exists -> amountInMinorUnit = ROUND(suma * 100)
 2. For each campaign: recompute raised = SUM(completed donations amountInMinorUnit)/100 (major units). Update if changed.
*/

// Strapi v5: programmatic usage via createStrapi named export
const { createStrapi } = require("@strapi/strapi");

const DRY_RUN = process.argv.includes("--dry");

async function backfill() {
  // Create Strapi instance and load config/plugins (no HTTP server start)
  const strapi = await createStrapi();
  await strapi.load();

  const donationUID = "api::donatii.donatii";
  const campaignUID = "api::campanie-de-donatii.campanie-de-donatii";

  const log = (...args) => console.log("[backfill]", ...args);
  log("Mode:", DRY_RUN ? "DRY RUN (no writes)" : "WRITE");

  // 1. Donations backfill
  const donations = await strapi.db
    .query(donationUID)
    .findMany({ select: ["id", "suma", "amountInMinorUnit"] });
  let updatedDonations = 0;
  for (const d of donations) {
    const hasAmount =
      d.amountInMinorUnit !== null && d.amountInMinorUnit !== undefined;
    if (!hasAmount && d.suma != null) {
      const minor = Math.round(Number(d.suma) * 100);
      log(
        `Donation #${d.id}: set amountInMinorUnit = ${minor} (from suma=${d.suma})`
      );
      if (!DRY_RUN) {
        await strapi.db
          .query(donationUID)
          .update({ where: { id: d.id }, data: { amountInMinorUnit: minor } });
      }
      updatedDonations++;
    }
  }

  // 2. Campaign raised recalculation
  const campaigns = await strapi.db
    .query(campaignUID)
    .findMany({ select: ["id", "raised"] });
  let updatedCampaigns = 0;
  for (const c of campaigns) {
    // Fetch completed donations for this campaign
    const campDonations = await strapi.db.query(donationUID).findMany({
      where: {
        campanie_de_donatii: c.id,
        stare: "completed",
      },
      select: ["amountInMinorUnit"],
    });
    const totalMinor = campDonations.reduce(
      (acc, d) => acc + (Number(d.amountInMinorUnit) || 0),
      0
    );
    const recomputedRaised = totalMinor / 100; // major units
    const currentRaised = Number(c.raised) || 0;
    const changed = Math.abs(recomputedRaised - currentRaised) > 0.000001;
    if (changed) {
      log(`Campaign #${c.id}: raised ${currentRaised} -> ${recomputedRaised}`);
      if (!DRY_RUN) {
        await strapi.db
          .query(campaignUID)
          .update({ where: { id: c.id }, data: { raised: recomputedRaised } });
      }
      updatedCampaigns++;
    }
  }

  log("Summary:", {
    donationsProcessed: donations.length,
    donationsBackfilled: updatedDonations,
    campaignsProcessed: campaigns.length,
    campaignsAdjusted: updatedCampaigns,
    dryRun: DRY_RUN,
  });

  await strapi.destroy();
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exitCode = 1;
});
