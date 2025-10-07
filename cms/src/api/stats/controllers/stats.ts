export default {
  async overview(ctx) {
    const diagnostics: any = { steps: [] };
    const safeNumber = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    let donations: any[] = [];
    let campaigns: any[] = [];
    let totalMinor = 0;

    // STEP 1: Donations
    try {
      diagnostics.steps.push("fetch-donations:start");
      // Removed selecting relation field name (campanie_de_donatii) which caused Postgres error
      donations =
        (await strapi.db.query("api::donatii.donatii").findMany({
          where: { stare: "completed" },
          select: ["id", "amountInMinorUnit"],
        })) || [];
      totalMinor = donations.reduce(
        (sum, d) => sum + safeNumber(d?.amountInMinorUnit),
        0
      );
      diagnostics.steps.push("fetch-donations:ok");
      diagnostics.donationsCount = donations.length;
    } catch (e) {
      diagnostics.steps.push("fetch-donations:fail");
      diagnostics.donationsError = (e as Error).message;
      strapi.log.error("[stats] donations query failed", e);
    }

    // STEP 2: Campaigns
    try {
      diagnostics.steps.push("fetch-campaigns:start");
      campaigns =
        (await strapi.db
          .query("api::campanie-de-donatii.campanie-de-donatii")
          .findMany({
            where: { publishedAt: { $notNull: true } },
            select: [
              "id",
              "title",
              "goal",
              "raised",
              "startDate",
              "endDate",
              "slug",
            ],
          })) || [];
      diagnostics.steps.push("fetch-campaigns:ok");
      diagnostics.campaignsCount = campaigns.length;
    } catch (e) {
      diagnostics.steps.push("fetch-campaigns:fail");
      diagnostics.campaignsError = (e as Error).message;
      strapi.log.error("[stats] campaigns query failed", e);
    }

    // If both failed, return 500 early
    if (diagnostics.donationsError && diagnostics.campaignsError) {
      ctx.status = 500;
      ctx.body = { error: "Stats processing failed", diagnostics };
      return;
    }

    let campaignsOut: any[] = [];
    try {
      const seen = new Set<string>();
      campaignsOut = campaigns
        .map((c) => {
          const goal = safeNumber(c.goal);
          const raised = safeNumber(c.raised);
          const progress =
            goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
          return {
            id: c.id,
            title: c.title,
            slug: c.slug,
            goal,
            raised,
            progress,
            startDate: c.startDate,
            endDate: c.endDate,
          };
        })
        .filter((c) => {
          const key = `${c.id}-${c.slug}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    } catch (e) {
      diagnostics.steps.push("map-campaigns:fail");
      diagnostics.mapError = (e as Error).message;
      strapi.log.error("[stats] mapping campaigns failed", e);
    }

    ctx.body = {
      totalDonations: totalMinor / 100,
      campaigns: campaignsOut,
      diagnostics,
    };
  },
};
