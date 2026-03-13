import { useEffect, useState } from "react";
import type { AsyncState } from "../types/async";
import type { StaticPage } from "../types/page";
import { fetchPage } from "../services/pages";

export function usePage(slug: string | undefined): AsyncState<StaticPage> {
  const [data, setData] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchPage(slug)
      .then((p) => {
        if (!active) return;
        setData(p);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Eroare la încărcare");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}
