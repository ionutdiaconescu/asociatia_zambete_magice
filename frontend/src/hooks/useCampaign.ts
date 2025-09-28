import { useEffect, useState } from "react";
import { fetchCampaignDetail } from "../services/campaigns";
import type { CampaignDetail, AsyncState } from "../types/campaign";

export function useCampaign(
  id: string | undefined
): AsyncState<CampaignDetail> {
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchCampaignDetail(id)
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
  }, [id, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}
