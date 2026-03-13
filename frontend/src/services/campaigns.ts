// Service layer for campaigns API integration (no React imports here).
// Falls back to mock data if CMS API is not reachable (early dev convenience).
import type {
  CampaignSummary,
  CampaignDetail,
  EnhancedCampaign,
} from "../types/campaign";
import { enhanceCampaign, enhanceMany } from "../utils/campaign";
import { resolveCmsApiConfig } from "./cmsConfig";
import { resolveMediaUrl } from "./cmsMedia";

// Mock data (fallback)
const mockCampaigns: CampaignSummary[] = [
  {
    id: "1",
    title: "Sprijin pentru educație rurală",
    slug: "sprijin-educatie-rurala",
    shortDescription: "Tablete și materiale educaționale pentru 50 de copii.",
    goal: 15000,
    raised: 3200,
    coverImage: "https://via.placeholder.com/640x360?text=Campanie+1",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Program after-school",
    slug: "program-after-school",
    shortDescription:
      "Activități și gustări sănătoase pentru elevi vulnerabili.",
    goal: 20000,
    raised: 9100,
    coverImage: "https://via.placeholder.com/640x360?text=Campanie+2",
    updatedAt: new Date().toISOString(),
  },
];
const mockEnhancedCampaigns = enhanceMany(mockCampaigns);

const { apiBase: API_BASE, mediaOrigin: API_ORIGIN } = resolveCmsApiConfig();
const DEBUG_CAMPAIGNS = Boolean(import.meta.env.VITE_DEBUG_CAMPAIGNS);

function computeCandidateBases(): string[] {
  return API_BASE ? [API_BASE] : [];
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(id);
  }
}

// Map a single Strapi campaign entry (list form) to internal type
interface StrapiMediaFormat {
  url?: string;
}
interface StrapiMediaItem {
  url?: string;
  data?: { attributes?: { url?: string } };
}
interface StrapiCampaignAttributes {
  title?: string;
  // allow possible alternative legacy field names (defensive)
  titlu?: string; // Romanian variant if ever used
  name?: string; // generic fallback
  slug?: string;
  shortDescription?: string;
  short_description?: string; // snake_case defensive
  body?: string;
  goal?: number | string;
  raised?: number | string;
  status?: string;
  stare?: string;
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
  coverImage?: StrapiMediaItem & {
    formats?: Record<string, StrapiMediaFormat>;
  };
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}
interface StrapiEntry<T> {
  id: number | string;
  attributes?: T; // Strapi standard format
  // In some unexpected cases we might already receive flattened fields (defensive)
  title?: string;
  titlu?: string;
  name?: string;
  slug?: string;
  shortDescription?: string;
  short_description?: string;
  body?: string;
  goal?: number | string;
  raised?: number | string;
  status?: string;
  stare?: string;
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
  coverImage?: StrapiCampaignAttributes["coverImage"];
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

function mapStrapiCampaign(
  entry: StrapiEntry<StrapiCampaignAttributes>,
): CampaignSummary {
  type Flat = StrapiCampaignAttributes & StrapiEntry<StrapiCampaignAttributes>;
  const a: Flat = (
    entry?.attributes ? { ...entry.attributes } : { ...entry }
  ) as Flat; // accept flattened variant
  // Normalize numeric fields (accept empty string -> 0)
  const goalNum =
    typeof a.goal === "string" && a.goal.trim() === ""
      ? 0
      : Number(a.goal) || 0;
  const raisedNum =
    typeof a.raised === "string" && a.raised.trim() === ""
      ? 0
      : Number(a.raised ?? 0);

  const title = a.title || a.titlu || a.name || "Fără titlu";
  if (!a.title && !a.titlu && !a.name) {
    // Log once per entry id to help debugging why placeholder appears
    if (typeof window !== "undefined") {
      console.debug("[campanii] Titlu lipsă în entry", entry.id, a);
    }
  }
  const shortDesc =
    a.shortDescription || a.short_description || a.body?.slice(0, 140) || "";
  const coverImage =
    resolveMediaUrl(a.coverImage, API_ORIGIN, 1600) || undefined;

  return enhanceCampaign({
    id: String(entry.id),
    title,
    slug: a.slug || String(entry.id),
    shortDescription: shortDesc,
    goal: goalNum,
    raised: raisedNum,
    status: a.status || a.stare,
    coverImage,
    isFeatured: Boolean(a.isFeatured),
    startDate: a.startDate,
    endDate: a.endDate,
    updatedAt: a.updatedAt || a.publishedAt,
  });
}

export async function fetchCampaigns(): Promise<
  EnhancedCampaign<CampaignSummary>[]
> {
  const base = computeCandidateBases()[0];
  if (!base) {
    console.error(
      "[campaigns] API base not set. Define VITE_API_CMS_URL in .env.local",
    );
    return mockEnhancedCampaigns;
  }
  const url = `${base.replace(
    /\/$/,
    "",
  )}/campaigns?populate=coverImage&sort=createdAt:desc`;
  try {
    if (DEBUG_CAMPAIGNS) console.debug("[campaigns] Fetch", url);
    const res = await safeFetch(url);
    if (res?.data && Array.isArray(res.data)) {
      if (DEBUG_CAMPAIGNS)
        console.debug("[campaigns] Success count=", res.data.length);
      return enhanceMany(res.data.map(mapStrapiCampaign));
    }
    console.warn("[campaigns] Unexpected payload shape", res);
  } catch (e) {
    if ((e as Error).message.includes("404")) {
      console.error(
        "[campaigns] 404 Not Found on /campaigns. Verifica daca Content-Type exista si este publicat.",
      );
    } else {
      console.error("[campaigns] Fetch error", e);
    }
  }
  return mockEnhancedCampaigns;
}

export async function fetchCampaignDetail(
  identifier: string,
): Promise<EnhancedCampaign<CampaignDetail>> {
  // identifier can be an id or slug. Try slug query first if not purely numeric.
  const isNumeric = /^\d+$/.test(identifier);
  try {
    const bases = computeCandidateBases();
    const slugPaths = [
      (b: string) =>
        `${b}/campaigns?filters[slug][$eq]=${encodeURIComponent(
          identifier,
        )}&populate=coverImage`,
    ];
    if (!isNumeric) {
      for (const base of bases) {
        for (const build of slugPaths) {
          try {
            const res = await safeFetch(build(base.replace(/\/$/, "")));
            if (res?.data?.length) {
              const entry = res.data[0];
              const mapped = mapStrapiCampaign(entry);
              return enhanceCampaign({
                ...mapped,
                body: entry.attributes?.body || "",
                createdAt:
                  entry.attributes?.createdAt || new Date().toISOString(),
                updatedAt:
                  entry.attributes?.updatedAt ||
                  mapped.updatedAt ||
                  new Date().toISOString(),
              });
            }
          } catch {
            /* try next */
          }
        }
      }
    }
    // Try by id with path variants
    const idPaths = [
      (b: string) => `${b}/campaigns/${identifier}?populate=coverImage`,
    ];
    for (const base of bases) {
      for (const build of idPaths) {
        try {
          const byId = await safeFetch(build(base.replace(/\/$/, "")));
          if (byId?.data) {
            const mapped = mapStrapiCampaign(byId.data);
            return enhanceCampaign({
              ...mapped,
              body: byId.data.attributes?.body || "",
              createdAt:
                byId.data.attributes?.createdAt || new Date().toISOString(),
              updatedAt:
                byId.data.attributes?.updatedAt ||
                mapped.updatedAt ||
                new Date().toISOString(),
            });
          }
        } catch {
          /* continue */
        }
      }
    }
    throw new Error("Format necunoscut detaliu (all variants failed)");
  } catch (e) {
    console.warn("Falling back to mock campaign detail", e);
    await delay(150);
    const basic = mockCampaigns.find((c) => c.id === identifier);
    if (!basic) throw new Error("Campanie negăsită");
    return enhanceCampaign({
      ...basic,
      body: "Conținut detaliat campanie (fallback mock) — înlocuiește cu date reale.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// React hooks moved to separate file (hooks/useCampaigns.ts & hooks/useCampaign.ts)
