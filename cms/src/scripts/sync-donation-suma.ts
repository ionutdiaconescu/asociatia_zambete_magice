/**
 * Sync 'suma' (decimal major units) from 'amountInMinorUnit' (integer, cents-like) for donations.
 * We keep 'suma' as a denormalized, human-readable value in Strapi admin.
 *
 * Behavior:
 *  - For each donation with amountInMinorUnit set, recompute suma = amountInMinorUnit/100 (fixed 2 decimals)
 *  - If amountInMinorUnit null but suma present, attempt a backfill in the opposite direction (set amountInMinorUnit)
 *  - Only write when a difference exists to minimize DB churn
 *  - Supports --dry for preview
 *
 * Run:
 *   npm run sync:donations -- --dry
 *   npm run sync:donations
 */

(async () => {
  // Gracefully ignore pool 'aborted' errors on shutdown
  process.on("unhandledRejection", (err: any) => {
    if (err && err.message === "aborted") {
      console.warn("[sync:donations] Ignored aborted (pool shutdown)");
      return;
    }
    console.error("[sync:donations] Unhandled rejection", err);
  });
  process.on("uncaughtException", (err: any) => {
    if (err && err.message === "aborted") {
      console.warn(
        "[sync:donations] Ignored aborted (uncaught during shutdown)"
      );
      return;
    }
    console.error("[sync:donations] Uncaught exception", err);
  });
  const DRY = process.argv.includes("--dry");
  console.log("[sync:donations] START", DRY ? "(dry-run)" : "");
  const { createStrapi } = await import("@strapi/strapi");
  const app = await createStrapi();
  // Use load() instead of start() so we don't bind the HTTP server / port 1337
  await app.load();
  try {
    const donationUid = "api::donatii.donatii";
    const es = app.entityService;

    // Batch processing (simple naive full fetch; adjust if dataset grows large)
    const donations = await es.findMany(donationUid, {
      fields: ["id", "suma", "amountInMinorUnit", "stare", "currency"],
      limit: 99999,
      publicationState: "preview",
    });

    if (!donations.length) {
      console.log("[sync:donations] No donations found.");
      return;
    }

    let updated = 0;
    for (const d of donations as Array<{
      id: number;
      suma?: any;
      amountInMinorUnit?: any;
      stare?: string;
      currency?: string;
    }>) {
      let writeNeeded = false;
      const patch: any = {};

      const currentMinor =
        typeof d.amountInMinorUnit === "number"
          ? d.amountInMinorUnit
          : d.amountInMinorUnit != null
            ? Number(d.amountInMinorUnit)
            : null;
      const currentSuma =
        typeof d.suma === "string"
          ? parseFloat(d.suma)
          : d.suma != null
            ? Number(d.suma)
            : null;

      if (currentMinor != null && !isNaN(currentMinor)) {
        const desiredSuma = +(currentMinor / 100).toFixed(2);
        if (
          currentSuma == null ||
          Math.abs(desiredSuma - currentSuma) > 0.009
        ) {
          patch.suma = desiredSuma;
          writeNeeded = true;
        }
      } else if (currentSuma != null && !isNaN(currentSuma)) {
        // Backfill minor units from suma
        const desiredMinor = Math.round(currentSuma * 100);
        patch.amountInMinorUnit = desiredMinor;
        writeNeeded = true;
      }

      if (writeNeeded) {
        if (!DRY) {
          await es.update(donationUid, d.id, { data: patch });
        }
        updated++;
        console.log(`[update] Donation #${d.id} ->`, patch);
      }
    }

    console.log(`[sync:donations] Updated ${updated} donation(s).`);
  } catch (err) {
    console.error("[sync:donations] ERROR", err);
    process.exitCode = 1;
  } finally {
    // Allow pending microtasks to settle before destroying (mitigates tarn aborted error)
    await new Promise((r) => setTimeout(r, 25));
    try {
      // @ts-ignore
      await app.destroy();
    } catch (e: any) {
      if (!(e && e.message === "aborted")) {
        console.warn("[sync:donations] destroy warning", e?.message || e);
      }
    }
    console.log("[sync:donations] DONE");
    process.exitCode = process.exitCode || 0;
  }
})();
