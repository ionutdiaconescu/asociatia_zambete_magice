import { useEffect, useState } from "react";
import type { CampaignSummary, AsyncState } from "../types/campaign";
import { fetchCampaigns } from "../services/campaigns";

// Canonical Strapi collection route: /api/campaigns
// Fetches published campaigns and maps to CampaignSummary

export function useCampaigns(): AsyncState<CampaignSummary[]> {
  const [data, setData] = useState<CampaignSummary[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0); // manual reload trigger

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const mapped = await fetchCampaigns();
        if (!cancelled) {
          setData(mapped);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Eroare la încărcare");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}
