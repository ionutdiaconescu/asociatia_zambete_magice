/**
 * Script de migrare pentru alinierea campului isFeatured pe baza valorii vechi idFeatured.
 * Rulare (din folderul cms):
 *   npx ts-node src/scripts/migrate-isFeatured.ts
 * Sau adaugă un script in package.json: "migrate:isFeatured": "ts-node src/scripts/migrate-isFeatured.ts"
 */
import path from "node:path";

const DRY_RUN = process.argv.includes("--dry");

// Lazy import pentru a nu porni Strapi înainte să validăm mediul
async function run() {
  const { env } = process;
  console.log("[migrate:isFeatured] START");

  // Bootstrap Strapi programatic
  const { createStrapi } = await import("@strapi/strapi");
  const appDir = path.resolve(__dirname, "../..");
  // createStrapi citește config din proiect; distDir nu e necesar în mod dev TS.
  const app = await createStrapi();

  try {
    await app.start();
    const uid = "api::campanie-de-donatii.campanie-de-donatii";
    const entityService = app.entityService;

    console.log(
      "[migrate:isFeatured] DEPRECATED: câmpul 'idFeatured' a fost eliminat. Nimic de făcut."
    );
  } catch (err) {
    console.error("[migrate:isFeatured] EROARE", err);
    process.exitCode = 1;
  } finally {
    try {
      await app.destroy();
    } catch {}
  }
}

run();
