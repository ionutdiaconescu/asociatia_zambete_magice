/**
 * Recompute 'raised' for each campaign from related completed donations.
 * Wrapped in an IIFE to avoid variable redeclaration when ts-node caches modules.
 */
(async () => {
  // Handlers to silence knex/tarn 'aborted' errors during rapid teardown
  process.on("unhandledRejection", (err: any) => {
    if (err && err.message === "aborted") {
      console.warn("[recompute:raised] Ignored aborted (pool shutdown)");
      return;
    }
    console.error("[recompute:raised] Unhandled rejection", err);
  });
  process.on("uncaughtException", (err: any) => {
    if (err && err.message === "aborted") {
      console.warn(
        "[recompute:raised] Ignored aborted (uncaught during shutdown)"
      );
      return;
    }
    console.error("[recompute:raised] Uncaught exception", err);
  });
  const DRY = process.argv.includes("--dry");
  console.log("[recompute:raised] START", DRY ? "(dry-run)" : "");
  const { createStrapi } = await import("@strapi/strapi");
  const app = await createStrapi();
  await app.load(); // evită pornirea serverului HTTP
  try {
    const campaignUid = "api::campanie-de-donatii.campanie-de-donatii";
    const es = app.entityService;

    const campaigns = await es.findMany(campaignUid, {
      fields: ["id", "raised", "goal", "title"],
      populate: {
        donatiis: { fields: ["id", "amountInMinorUnit", "suma", "stare"] },
      },
      publicationState: "preview",
      limit: 9999,
    });

    if (!campaigns.length) {
      console.log("[recompute:raised] No campaigns found.");
      return;
    }

    let changed = 0;
    for (const c of campaigns as Array<{
      id: number;
      raised?: any;
      title?: string;
      donatiis?: any[];
    }>) {
      const donations = (c.donatiis || []).filter(
        (d) => d && d.stare === "completed"
      );
      if (!donations.length) {
        const currentRaisedZero =
          typeof c.raised === "string"
            ? parseFloat(c.raised)
            : Number(c.raised || 0);
        if (currentRaisedZero !== 0) {
          if (!DRY)
            await es.update(campaignUid, c.id, { data: { raised: 0 } as any });
          changed++;
          console.log(
            `[update] Campaign #${c.id} -> raised=0 (no completed donations)`
          );
        }
        continue;
      }
      let totalMinor = 0;
      let usedFallback = false;
      for (const d of donations) {
        if (
          typeof d.amountInMinorUnit === "number" &&
          !isNaN(d.amountInMinorUnit)
        ) {
          totalMinor += d.amountInMinorUnit;
        } else if (d.suma != null) {
          const val =
            typeof d.suma === "string" ? parseFloat(d.suma) : Number(d.suma);
          if (!isNaN(val)) {
            totalMinor += Math.round(val * 100);
            usedFallback = true;
          }
        }
      }
      const computedRaised = +(totalMinor / 100).toFixed(2);
      const currentRaised =
        typeof c.raised === "string"
          ? parseFloat(c.raised)
          : Number(c.raised || 0);
      if (Math.abs(computedRaised - currentRaised) > 0.009) {
        if (!DRY)
          await es.update(campaignUid, c.id, {
            data: { raised: computedRaised } as any,
          });
        changed++;
        console.log(
          `[update] Campaign #${c.id} '${c.title || ""}' raised: ${currentRaised} -> ${computedRaised}${usedFallback ? " (fallback suma used)" : ""}`
        );
      }
    }
    console.log(`[recompute:raised] Changed ${changed} campaign(s).`);
  } catch (err) {
    console.error("[recompute:raised] ERROR", err);
    process.exitCode = 1;
  } finally {
    // Small delay lets pending queries settle to avoid tarn aborted errors
    await new Promise((r) => setTimeout(r, 25));
    try {
      await app.destroy();
    } catch (e: any) {
      if (!(e && e.message === "aborted")) {
        console.warn("[recompute:raised] destroy warning", e?.message || e);
      } else {
        console.warn("[recompute:raised] Ignored aborted during destroy");
      }
    }
    console.log("[recompute:raised] DONE");
    process.exitCode = process.exitCode || 0;
  }
})();
