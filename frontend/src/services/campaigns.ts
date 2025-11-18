// Service layer for campaigns API integration (no React imports here).
// Falls back to mock data if backend not reachable (early dev convenience).
import type { CampaignSummary, CampaignDetail } from "../types/campaign";
import { enhanceCampaign, enhanceMany } from "../utils/campaign";

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

// Base API: prefer explicit env, otherwise relative '/api' (may point to frontend dev server and 404)
const API_BASE = import.meta.env.VITE_API_CMS_URL || "/api"; // expected: http://localhost:1337/api
const DEBUG_CAMPAIGNS = Boolean(import.meta.env.VITE_DEBUG_CAMPAIGNS);
// If API_BASE is relative, try to guess Strapi dev origin (1337) as a fallback at runtime in browser
function computeCandidateBases(): string[] {
  const bases: string[] = [API_BASE];
  if (API_BASE.startsWith("/")) {
    if (typeof window !== "undefined") {
      const guess = `${window.location.protocol}//${window.location.hostname}:1337/api`;
      if (!bases.includes(guess)) bases.push(guess);
    }
  }
  return bases;
}
const API_ORIGIN = (
  API_BASE.startsWith("/")
    ? typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:1337` // best guess for media
      : ""
    : API_BASE
).replace(/\/?api$/, "");

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
  coverImage?: StrapiCampaignAttributes["coverImage"];
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

function mapStrapiCampaign(
  entry: StrapiEntry<StrapiCampaignAttributes>
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
  const img = a.coverImage as StrapiMediaItem | undefined;
  const urlRel = img?.url || img?.data?.attributes?.url;
  const coverImage = urlRel
    ? urlRel.startsWith("http")
      ? urlRel
      : API_ORIGIN.replace(/\/$/, "") + urlRel
    : undefined;

  return enhanceCampaign({
    id: String(entry.id),
    title,
    slug: a.slug || String(entry.id),
    shortDescription: shortDesc,
    goal: goalNum,
    raised: raisedNum,
    status: a.status || a.stare,
    coverImage,
    updatedAt: a.updatedAt || a.publishedAt,
  });
}

export async function fetchCampaigns(): Promise<CampaignSummary[]> {
  const bases = computeCandidateBases();
  const paths = [
    "campaigns", // actual current Strapi plural
    "campanie-de-donatiis", // historical guess with added 's'
    "campanie-de-donatii", // historical singular form
  ];
  const qs = "?populate=coverImage&sort=createdAt:desc";
  let lastError: unknown = null;
  const attempts: { url: string; error?: unknown }[] = [];
  for (const base of bases) {
    for (const p of paths) {
      const url = `${base.replace(/\/$/, "")}/${p}${qs}`;
      try {
        if (DEBUG_CAMPAIGNS) console.debug("[campaigns] Attempting", url);
        const res = await safeFetch(url);
        if (res?.data && Array.isArray(res.data)) {
          if (DEBUG_CAMPAIGNS) {
            console.debug(
              "[campaigns] Success",
              url,
              "count=",
              res.data.length
            );
          }
          // Prefer only the canonical path for future attempts if success came from a fallback
          return enhanceMany(res.data.map(mapStrapiCampaign));
        } else {
          attempts.push({ url, error: new Error("Unexpected payload shape") });
        }
      } catch (err) {
        lastError = err;
        attempts.push({ url, error: err });
        // continue trying other combinations
      }
    }
  }
  if (DEBUG_CAMPAIGNS) {
    console.warn("[campaigns] All attempts failed. Details:", attempts);
  } else {
    console.warn(
      "Falling back to mock campaigns (all attempts failed)",
      lastError
    );
  }
  await delay(150);
  return mockCampaigns;
}

export async function fetchCampaignDetail(
  identifier: string
): Promise<CampaignDetail> {
  // identifier can be an id or slug. Try slug query first if not purely numeric.
  const isNumeric = /^\d+$/.test(identifier);
  try {
    const bases = computeCandidateBases();
    const slugPaths = [
      (b: string) =>
        `${b}/campanie-de-donatiis?filters[slug][$eq]=${encodeURIComponent(
          identifier
        )}&populate=coverImage`,
      (b: string) =>
        `${b}/campanie-de-donatii?filters[slug][$eq]=${encodeURIComponent(
          identifier
        )}&populate=coverImage`,
      (b: string) =>
        `${b}/campaigns?filters[slug][$eq]=${encodeURIComponent(
          identifier
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
      (b: string) =>
        `${b}/campanie-de-donatiis/${identifier}?populate=coverImage`,
      (b: string) =>
        `${b}/campanie-de-donatii/${identifier}?populate=coverImage`,
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
