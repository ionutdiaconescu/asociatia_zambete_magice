import { useState, useEffect } from "react";

interface HomepageData {
  id: number;
  documentId: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string | null;
  heroCtaText: string | null;
  heroCtaLink: string | null;
  heroBackgroundImage: string | null;
  statsYearsActive: number;
  statsTotalBeneficiaries: number;
  statsCompletedProjects: number;
  statsActiveVolunteers: number;
  howWeWorkTitle: string | null;
  howWeWorkDescription: string | null;
  impactGalleryTitle: string | null;
  impactGalleryDescription: string | null;
  teamTitle: string | null;
  teamDescription: string | null;
  transparencyTitle: string | null;
  donationIban?: string | null; // Added
  donationBankName?: string | null;
  donationBeneficiaryName?: string | null;
  donationInstructions?: string | null;
  donationReferenceHint?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoSocialImage?: string | null;
}

type RichTextChild = {
  type?: string;
  text?: string;
  children?: RichTextChild[];
};
interface RichTextObject {
  children?: RichTextChild[];
}
type RichTextBlock =
  | RichTextObject
  | string
  | RichTextBlock[]
  | null
  | undefined;

const devPorts = new Set(["5173", "5174", "3000"]);

function resolveCmsApiConfig() {
  const isBrowser = typeof window !== "undefined";
  const envBase = (import.meta.env.VITE_API_CMS_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "");

  let apiBase = envBase;
  if (!apiBase) {
    if (isBrowser && devPorts.has(window.location.port)) {
      apiBase = "/api"; // rely on Vite proxy in dev
    } else if (
      isBrowser &&
      /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
    ) {
      apiBase = `http://${window.location.hostname}:1337/api`;
    } else if (isBrowser) {
      apiBase = `${window.location.origin.replace(/\/$/, "")}/api`;
    } else {
      apiBase = "http://localhost:1337/api";
    }
  }

  if (!/\/api$/i.test(apiBase)) {
    apiBase = `${apiBase.replace(/\/$/, "")}/api`;
  }

  const mediaOrigin = apiBase.startsWith("http")
    ? apiBase.replace(/\/api$/i, "")
    : isBrowser
      ? window.location.origin
      : "";

  return { apiBase, mediaOrigin };
}

function absolutizeMediaUrl(raw: string | null | undefined, origin: string) {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (!origin) return raw;
  if (raw.startsWith("/")) return `${origin}${raw}`;
  return `${origin}/${raw}`;
}

function pickPreferredFormatUrl(
  formats: Record<string, { url?: string; width?: number }> | undefined,
  targetWidth: number,
) {
  if (!formats || typeof formats !== "object") return null;
  const candidates = Object.values(formats).filter(
    (f): f is { url: string; width?: number } => !!f?.url,
  );
  if (!candidates.length) return null;

  candidates.sort((a, b) => {
    const aw = a.width ?? 0;
    const bw = b.width ?? 0;
    return Math.abs(aw - targetWidth) - Math.abs(bw - targetWidth);
  });

  return candidates[0]?.url ?? null;
}

function resolveMediaUrl(
  input: unknown,
  origin: string,
  targetWidth = 1600,
): string | null {
  if (!input) return null;

  if (typeof input === "string") {
    return absolutizeMediaUrl(input, origin);
  }

  if (Array.isArray(input)) {
    return resolveMediaUrl(input[0], origin, targetWidth);
  }

  if (typeof input !== "object") return null;

  const media = input as {
    url?: string;
    formats?: Record<string, { url?: string; width?: number }>;
    attributes?: {
      url?: string;
      formats?: Record<string, { url?: string; width?: number }>;
    };
    data?:
      | {
          url?: string;
          formats?: Record<string, { url?: string; width?: number }>;
          attributes?: {
            url?: string;
            formats?: Record<string, { url?: string; width?: number }>;
          };
        }
      | Array<{
          url?: string;
          attributes?: {
            url?: string;
            formats?: Record<string, { url?: string; width?: number }>;
          };
        }>;
  };

  const fromDataArray = Array.isArray(media.data)
    ? resolveMediaUrl(media.data[0], origin, targetWidth)
    : null;
  if (fromDataArray) return fromDataArray;

  const formatUrl = pickPreferredFormatUrl(
    media.formats ||
      media.attributes?.formats ||
      (!Array.isArray(media.data)
        ? media.data?.formats || media.data?.attributes?.formats
        : undefined),
    targetWidth,
  );
  if (formatUrl) {
    return absolutizeMediaUrl(formatUrl, origin);
  }

  const rawUrl =
    media.url ||
    media.attributes?.url ||
    (!Array.isArray(media.data) ? media.data?.url : undefined) ||
    (!Array.isArray(media.data) ? media.data?.attributes?.url : undefined);

  return absolutizeMediaUrl(rawUrl, origin);
}

// Funcție pentru a converti rich-text în string simplu
function extractTextFromRichText(richText: RichTextBlock): string | null {
  if (!richText) return null;
  if (typeof richText === "string") return richText;
  if (Array.isArray(richText)) {
    return richText
      .map((block) => {
        if (
          block &&
          typeof block === "object" &&
          "children" in block &&
          Array.isArray(block.children)
        ) {
          return block.children
            .map((child) => {
              if (child.type === "text" && child.text) return child.text;
              if (child.children)
                return extractTextFromRichText({ children: child.children });
              return "";
            })
            .join("");
        }
        return "";
      })
      .join(" ");
  }
  if (
    richText &&
    typeof richText === "object" &&
    "children" in richText &&
    Array.isArray(richText.children)
  ) {
    return richText.children
      .map((child) => {
        if (child.type === "text" && child.text) return child.text;
        if (child.children)
          return extractTextFromRichText({ children: child.children });
        return "";
      })
      .join(" ");
  }
  return null;
}

export function useHomepage() {
  const [homepage, setHomepage] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        setLoading(true);
        const { apiBase, mediaOrigin } = resolveCmsApiConfig();
        const apiUrl = `${apiBase}/homepage?populate=*`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseOrigin = (() => {
          try {
            return response.url ? new URL(response.url).origin : "";
          } catch {
            return "";
          }
        })();
        const effectiveMediaOrigin = mediaOrigin || responseOrigin;

        const result = await response.json();
        const raw = result?.data as {
          id?: number | string;
          attributes?: Record<string, unknown>;
          documentId?: string;
        } | null;
        if (!raw) throw new Error("Homepage: răspuns gol (data lipsă)");
        // Strapi v5: { data: { id, attributes: {...} } }
        const attrs: Record<string, unknown> = raw.attributes
          ? (raw.attributes as Record<string, unknown>)
          : (raw as unknown as Record<string, unknown>);
        type Attrs = {
          heroTitle?: string;
          heroSubtitle?: string;
          heroDescription?: RichTextBlock;
          heroBackgroundMedia?: unknown; // definit în schema
          heroBackgroundImage?: unknown; // fallback dacă denumire diferă
          heroBackground?: unknown; // alte posibile încercări
          heroCtaText?: string | null;
          heroCtaLink?: string | null;
          statsYearsActive?: number;
          statsTotalBeneficiaries?: number;
          statsCompletedProjects?: number;
          statsActiveVolunteers?: number;
          howWeWorkTitle?: string | null;
          howWeWorkDescription?: RichTextBlock;
          impactGalleryTitle?: string | null;
          impactGalleryDescription?: RichTextBlock;
          teamTitle?: string | null;
          teamDescription?: RichTextBlock;
          transparencyTitle?: string | null;
          donationIban?: string | null;
          donationBankName?: string | null;
          donationBeneficiaryName?: string | null;
          donationInstructions?: RichTextBlock;
          donationReferenceHint?: string | null;
          seoTitle?: string | null;
          seoDescription?: string | null;
          seoSocialImage?: unknown;
        };
        const a = attrs as Attrs;

        // Determină media pentru background hero din variante multiple de câmp
        const heroBgSource =
          a.heroBackgroundMedia ??
          a.heroBackgroundImage ??
          a.heroBackground ??
          null;

        const processedData: HomepageData = {
          id:
            typeof raw.id === "string"
              ? Number(raw.id) || 0
              : Number(raw.id || 0),
          documentId: raw.documentId ?? String(raw.id ?? "homepage"),
          heroTitle: a.heroTitle ?? "",
          heroSubtitle: a.heroSubtitle ?? "",
          heroDescription: extractTextFromRichText(a.heroDescription),
          heroCtaText: a.heroCtaText ?? null,
          heroCtaLink: a.heroCtaLink ?? null,
          heroBackgroundImage: resolveMediaUrl(
            heroBgSource,
            effectiveMediaOrigin,
            1920,
          ),
          statsYearsActive: Number(a.statsYearsActive ?? 0),
          statsTotalBeneficiaries: Number(a.statsTotalBeneficiaries ?? 0),
          statsCompletedProjects: Number(a.statsCompletedProjects ?? 0),
          statsActiveVolunteers: Number(a.statsActiveVolunteers ?? 0),
          howWeWorkTitle: a.howWeWorkTitle ?? null,
          howWeWorkDescription: extractTextFromRichText(a.howWeWorkDescription),
          impactGalleryTitle: a.impactGalleryTitle ?? null,
          impactGalleryDescription: extractTextFromRichText(
            a.impactGalleryDescription,
          ),
          teamTitle: a.teamTitle ?? null,
          teamDescription: extractTextFromRichText(a.teamDescription),
          transparencyTitle: a.transparencyTitle ?? null,
          // Donații / SEO
          donationIban: a.donationIban ?? null,
          donationBankName: a.donationBankName ?? null,
          donationBeneficiaryName: a.donationBeneficiaryName ?? null,
          donationInstructions: extractTextFromRichText(a.donationInstructions),
          donationReferenceHint: a.donationReferenceHint ?? null,
          seoTitle: a.seoTitle ?? null,
          seoDescription: a.seoDescription ?? null,
          seoSocialImage: resolveMediaUrl(
            a.seoSocialImage,
            effectiveMediaOrigin,
            1200,
          ),
        };
        setHomepage(processedData);
        setError(null);
      } catch (err) {
        console.error("[Homepage] Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        const fallbackData: HomepageData = {
          id: 0,
          documentId: "fallback",
          heroTitle: "Transformăm nevoi în zâmbete magice",
          heroSubtitle: "Fiecare copil merită o șansă",
          heroDescription:
            "Asociația Zâmbete Magice lucrează pentru copiii care au nevoie de sprijin în Timișoara și împrejurimi.",
          heroCtaText: "Vezi campaniile noastre",
          heroCtaLink: "/campanii",
          heroBackgroundImage: null,
          statsYearsActive: 6,
          statsTotalBeneficiaries: 1234,
          statsCompletedProjects: 15,
          statsActiveVolunteers: 234,
          howWeWorkTitle: "Cum lucrăm",
          howWeWorkDescription:
            "Procesul nostru este transparent și eficient, axat pe nevoile reale ale copiilor.",
          impactGalleryTitle: "Impactul nostru",
          impactGalleryDescription:
            "Vezi transformările pe care le-am realizat împreună.",
          teamTitle: "Echipa noastră",
          teamDescription: "Oameni dedicați unei cauze nobile.",
          transparencyTitle: "Transparență",
          donationIban: null,
          donationBankName: null,
          donationBeneficiaryName: null,
          donationInstructions: null,
          donationReferenceHint: null,
          seoTitle: null,
          seoDescription: null,
          seoSocialImage: null,
        };
        console.log("[Homepage] Using fallback data");
        setHomepage(fallbackData);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepage();
  }, []);

  return { homepage, loading, error };
}
