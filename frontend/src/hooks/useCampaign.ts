import { useState, useEffect } from "react";
import type { Campaign } from "../types/Campaign";

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
      const apiBase =
        import.meta.env.VITE_API_CMS_URL || "http://localhost:1337/api";
      const origin = apiBase.replace(/\/?api$/, "");
      const url = `${apiBase.replace(
        /\/$/,
        ""
      )}/campanie-de-donatiis?filters[slug][$eq]=${encodeURIComponent(
        slug
      )}&populate=coverImage`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!Array.isArray(json?.data) || !json.data.length)
          throw new Error("Campania nu a fost găsită");
        const raw = json.data[0];
        const a = raw?.attributes ? { ...raw.attributes } : raw;
        const goal = Number(a.goal) || 0;
        const raised = Number(a.raised) || 0;
        const media = a.coverImage?.data?.attributes?.url || a.coverImage?.url;
        const coverImage = media
          ? media.startsWith("http")
            ? media
            : origin.replace(/\/$/, "") + media
          : undefined;
        // Campaign.id in types may be number; ensure numeric if possible
        const numericId =
          typeof raw.id === "number" ? raw.id : Number(raw.id) || 0;
        interface FeatureAttrs {
          isFeatured?: boolean;
        }
        const feat = a as FeatureAttrs;
        const campaign: Campaign = {
          id: numericId,
          slug: (a.slug as string) || String(raw.id),
          title:
            (a.title as string) ||
            (a.titlu as string) ||
            (a.name as string) ||
            "Fără titlu",
          shortDescription:
            (a.shortDescription as string) ||
            (a.short_description as string) ||
            (a.description as string) ||
            "",
          description: (a.description as string) || (a.body as string) || "",
          goal,
          raised,
          status: (a.status as string) || "active",
          coverImage: (coverImage as string | undefined) || null,
          donorCount: (a.donorCount as number) || 0,
          daysLeft: a.daysLeft as number | undefined,
          isFeatured: feat.isFeatured ?? false,
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
