#!/usr/bin/env node
"use strict";
// Populate lower homepage sections with sample content if empty
const { createStrapi } = require("@strapi/strapi");
(async () => {
  const strapi = await createStrapi();
  await strapi.start();
  try {
    const uid = "api::homepage.homepage";
    const homepage = await strapi.entityService.findMany(uid, {
      populate: "*",
    });
    if (!homepage || !homepage.id) {
      console.error("Homepage not found");
      return;
    }
    const updates = {};
    const setIfEmpty = (field, value) => {
      const v = homepage[field];
      if (
        v === null ||
        v === undefined ||
        (typeof v === "string" && v.trim() === "")
      ) {
        updates[field] = value;
      }
    };
    setIfEmpty("howWeWorkTitle", "Cum lucrăm");
    setIfEmpty(
      "howWeWorkDescription",
      "Explicăm transparent pașii prin care transformăm donațiile în impact real."
    );
    setIfEmpty("impactGalleryTitle", "Impactul nostru");
    setIfEmpty(
      "impactGalleryDescription",
      "Galerie și testimoniale vor fi adăugate curând."
    );
    setIfEmpty("teamTitle", "Echipa noastră");
    setIfEmpty(
      "teamDescription",
      "Suntem voluntari dedicați cauzelor copiilor vulnerabili."
    );
    setIfEmpty("transparencyTitle", "Transparență financiară");
    setIfEmpty("donationIban", "RO00BANK0000000000000000");
    setIfEmpty("donationBankName", "Banca Exemplu");
    setIfEmpty("donationBeneficiaryName", "Asociatia Zambete Magice");
    setIfEmpty(
      "donationInstructions",
      "Introduceți referința DONATIE și scopul sprijinului."
    );
    setIfEmpty("donationReferenceHint", "DONATIE CAMPANIE COPII");
    setIfEmpty("seoTitle", "Asociația Zâmbete Magice - Ajutăm copiii");
    setIfEmpty(
      "seoDescription",
      "Transformăm nevoi în zâmbete. Implică-te în campaniile noastre."
    );

    if (Object.keys(updates).length === 0) {
      console.log("No empty lower-section fields to populate.");
      return;
    }
    const updated = await strapi.entityService.update(uid, homepage.id, {
      data: updates,
    });
    console.log("Updated homepage fields:", Object.keys(updates).join(", "));
  } catch (e) {
    console.error("populate-homepage-sections error:", e.message);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
