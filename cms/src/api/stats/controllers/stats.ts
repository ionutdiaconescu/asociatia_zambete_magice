export default {
  async overview(ctx) {
    const diagnostics: any = { steps: [] };
    const safeNumber = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const toMinorUnits = (donation: any) => {
      const minor = safeNumber(donation?.amountInMinorUnit);
      if (minor > 0) return Math.round(minor);

      const suma = safeNumber(donation?.suma);
      return suma > 0 ? Math.round(suma * 100) : 0;
    };
    const monthFormatter = new Intl.DateTimeFormat("ro-RO", {
      month: "short",
      year: "numeric",
    });
    let donations: any[] = [];
    let campaigns: any[] = [];
    let totalMinor = 0;
    const monthlyBuckets = new Map<
      string,
      { month: string; label: string; totalMinor: number; count: number }
    >();
    const paymentMethods = {
      card: { count: 0, totalMinor: 0 },
      iban: { count: 0, totalMinor: 0 },
    };

    // STEP 1: Donations
    try {
      diagnostics.steps.push("fetch-donations:start");
      donations =
        (await strapi.db.query("api::donatii.donatii").findMany({
          where: { stare: "completed" },
          select: [
            "id",
            "amountInMinorUnit",
            "suma",
            "stripeSessionId",
            "createdAt",
          ],
        })) || [];
      for (const donation of donations) {
        const currentMinor = toMinorUnits(donation);
        totalMinor += currentMinor;

        const method = donation?.stripeSessionId ? "card" : "iban";
        paymentMethods[method].count += 1;
        paymentMethods[method].totalMinor += currentMinor;

        if (donation?.createdAt) {
          const date = new Date(donation.createdAt);
          if (!Number.isNaN(date.getTime())) {
            const month = date.toISOString().slice(0, 7);
            const existing = monthlyBuckets.get(month) || {
              month,
              label: monthFormatter.format(date),
              totalMinor: 0,
              count: 0,
            };
            existing.totalMinor += currentMinor;
            existing.count += 1;
            monthlyBuckets.set(month, existing);
          }
        }
      }
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
      const campaignResult = await strapi.entityService.findMany(
        "api::campanie-de-donatii.campanie-de-donatii",
        {
          fields: ["id", "title", "goal", "startDate", "endDate", "slug"],
          populate: {
            donatiis: {
              fields: ["id", "amountInMinorUnit", "suma", "stare"],
            },
          },
          publicationState: "live",
          limit: 9999,
        },
      );
      campaigns = Array.isArray(campaignResult)
        ? campaignResult
        : campaignResult
          ? [campaignResult]
          : [];
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
          const completedDonations = Array.isArray(c.donatiis)
            ? c.donatiis.filter(
                (donation: any) => donation?.stare === "completed",
              )
            : [];
          const raisedMinor = completedDonations.reduce(
            (sum: number, donation: any) => sum + toMinorUnits(donation),
            0,
          );
          const raised = +(raisedMinor / 100).toFixed(2);
          const progress =
            goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
          return {
            id: c.id,
            title: c.title,
            slug: c.slug,
            goal,
            raised,
            donorCount: completedDonations.length,
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

    const monthlyTotals = Array.from(monthlyBuckets.values())
      .sort((left, right) => left.month.localeCompare(right.month))
      .slice(-12)
      .map((entry) => ({
        month: entry.month,
        label: entry.label,
        count: entry.count,
        totalDonations: +(entry.totalMinor / 100).toFixed(2),
      }));

    ctx.body = {
      generatedAt: new Date().toISOString(),
      totalDonations: totalMinor / 100,
      donationsCount: donations.length,
      paymentMethods: {
        card: {
          count: paymentMethods.card.count,
          totalDonations: +(paymentMethods.card.totalMinor / 100).toFixed(2),
        },
        iban: {
          count: paymentMethods.iban.count,
          totalDonations: +(paymentMethods.iban.totalMinor / 100).toFixed(2),
        },
        total: {
          count: donations.length,
          totalDonations: +(totalMinor / 100).toFixed(2),
        },
      },
      monthlyTotals,
      campaigns: campaignsOut,
      diagnostics,
    };
  },
};
