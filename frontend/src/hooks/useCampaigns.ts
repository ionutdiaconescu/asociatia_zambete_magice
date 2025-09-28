import { useEffect, useState } from "react";
import { fetchCampaigns } from "../services/campaigns";
import type { CampaignSummary, AsyncState } from "../types/campaign";

export function useCampaigns(): AsyncState<CampaignSummary[]> {
  const [data, setData] = useState<CampaignSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchCampaigns()
      .then((d) => {
        if (!active) return;
        setData(d);
      })
      .catch((e: unknown) => {
        if (!active) return;
        const msg = e instanceof Error ? e.message : "Eroare la încărcare";
        setError(msg);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}
