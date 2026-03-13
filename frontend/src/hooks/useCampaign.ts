import { useState, useEffect } from "react";
import type { Campaign } from "../types/campaign";
import { fetchCampaignDetail } from "../services/campaigns";

// Canonical detail fetch using slug filter against plural collection route.
export function useCampaign(slug: string) {
  const [data, setData] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const detail = await fetchCampaignDetail(slug);
        const numericId = Number(detail.id);

        const campaign: Campaign = {
          id: Number.isFinite(numericId) ? numericId : 0,
          slug: detail.slug,
          title: detail.title,
          shortDescription: detail.shortDescription,
          description: detail.body || detail.shortDescription,
          goal: detail.goal,
          raised: detail.raised,
          status: detail.status || "active",
          coverImage: detail.coverImage || null,
          donorCount: 0,
          daysLeft: undefined,
          isFeatured: detail.isFeatured ?? false,
          startDate: detail.startDate,
          endDate: detail.endDate,
          progressPercent: detail.progressPercent,
          remaining: detail.remaining,
          isCompleted: detail.isCompleted,
          isActiveNow: detail.isActiveNow,
          isHistorical: detail.isHistorical,
        };

        if (!cancelled) {
          setData(campaign);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Eroare la încărcare");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading, error };
}
