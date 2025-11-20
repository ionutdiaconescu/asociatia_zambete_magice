#!/usr/bin/env node
"use strict";
// Diagnostics: list homepage fields and highlight missing lower-section values
const { createStrapi } = require("@strapi/strapi");
(async () => {
  const strapi = await createStrapi();
  await strapi.start();
  try {
    const uid = "api::homepage.homepage";
    const data = await strapi.entityService.findMany(uid, { populate: "*" });
    if (!data || !data.id) {
      console.log("Homepage record not found");
      return;
    }
    const entry = data; // singleType returns object
    const fields = [
      "heroTitle",
      "heroSubtitle",
      "heroDescription",
      "heroCtaText",
      "heroCtaLink",
      "heroBackgroundMedia",
      "statsYearsActive",
      "statsTotalBeneficiaries",
      "statsCompletedProjects",
      "statsActiveVolunteers",
      "howWeWorkTitle",
      "howWeWorkDescription",
      "impactGalleryTitle",
      "impactGalleryDescription",
      "teamTitle",
      "teamDescription",
      "transparencyTitle",
      "donationIban",
      "donationBankName",
      "donationBeneficiaryName",
      "donationInstructions",
      "donationReferenceHint",
      "seoTitle",
      "seoDescription",
      "seoSocialImage",
    ];
    console.log("\nHomepage field audit (id=" + entry.id + ")");
    fields.forEach((f) => {
      const v = entry[f];
      let status = "OK";
      if (
        v === null ||
        v === undefined ||
        (typeof v === "string" && v.trim() === "")
      )
        status = "EMPTY";
      if (f.endsWith("Description") && v && typeof v === "object")
        status = "RICHOBJECT";
      console.log(f.padEnd(28), "=>", status);
    });
    // Show raw keys count
    console.log("\nKeys present:", Object.keys(entry).length);
  } catch (e) {
    console.error("diagnose-homepage-sections error:", e.message);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
