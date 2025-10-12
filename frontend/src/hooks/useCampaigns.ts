import { useEffect, useState } from "react";
import type { CampaignSummary, AsyncState } from "../types/Campaign";

// Canonical Strapi collection route: /api/campanie-de-donatiis
// We bypass the older service fallback logic and hit the definitive endpoint.

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
      const apiBase =
        import.meta.env.VITE_API_CMS_URL || "http://localhost:1337/api";
      const origin = apiBase.replace(/\/?api$/, "");
      const url = `${apiBase.replace(
        /\/$/,
        ""
      )}/campanie-de-donatiis?populate=coverImage&sort=createdAt:desc`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json?.data) ? json.data : [];
        const today = new Date();
        const mapped: CampaignSummary[] = items.map((entry: unknown) => {
          const e = entry as {
            id: number | string;
            attributes?: Record<string, unknown>;
          };
          const aRaw = e?.attributes
            ? { ...(e.attributes as Record<string, unknown>) }
            : (e as Record<string, unknown>);
          const a = aRaw as Record<string, unknown> & {
            title?: string;
            titlu?: string;
            name?: string;
            slug?: string;
            shortDescription?: string;
            short_description?: string;
            body?: string;
            goal?: number | string;
            raised?: number | string;
            coverImage?: {
              data?: { attributes?: { url?: string } };
              url?: string;
            };
            updatedAt?: string;
            publishedAt?: string;
            createdAt?: string;
          };
          const goal = Number(a.goal) || 0;
          const raised = Number(a.raised) || 0;
          // coverImage may be inside attributes.coverImage.data.attributes.url or directly .url
          const media =
            a.coverImage?.data?.attributes?.url || a.coverImage?.url;
          const coverImage = media
            ? media.startsWith("http")
              ? media
              : origin.replace(/\/$/, "") + media
            : undefined;
          interface AttrsExt {
            startDate?: string;
            endDate?: string;
            status?: string;
            stare?: string;
          }
          const ext = a as unknown as AttrsExt;
          const startDate = ext.startDate;
          const endDate = ext.endDate;
          // Classification logic
          const startOk = !startDate || new Date(startDate) <= today;
          // endDate strictly before today => historical
          const notEnded = !endDate || new Date(endDate) >= today;
          const status = ext.status || ext.stare;
          const completed = status === "completed";
          const activeLike = status === "active" || status === "paused";
          const isActiveNow = activeLike && startOk && notEnded && !completed;
          const isHistorical =
            completed || (!!endDate && new Date(endDate) < today);

          return {
            id: String(e.id),
            title: a.title || a.titlu || a.name || "Fără titlu",
            slug: a.slug || String(e.id),
            shortDescription:
              a.shortDescription ||
              a.short_description ||
              a.body?.slice(0, 140) ||
              "",
            goal,
            raised,
            coverImage,
            updatedAt: a.updatedAt || a.publishedAt || a.createdAt,
            startDate,
            endDate,
            isActiveNow,
            isHistorical,
          };
        });
        if (!cancelled) setData(mapped);
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
