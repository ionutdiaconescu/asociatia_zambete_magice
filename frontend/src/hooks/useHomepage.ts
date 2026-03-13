import { useState, useEffect } from "react";
import { resolveCmsApiConfig } from "../services/cmsConfig";
import { resolveMediaUrl } from "../services/cmsMedia";
import type {
  HomepageCmsAttributes,
  HomepageCmsEntry,
  HomepageData,
  HomepageRichTextBlock,
} from "../types/homepage";

function resolveMediaList(
  input: unknown,
  origin: string,
  targetWidth = 1600,
): string[] {
  if (!input) return [];

  const urls = new Set<string>();
  const add = (candidate: unknown) => {
    const u = resolveMediaUrl(candidate, origin, targetWidth);
    if (u) urls.add(u);
  };

  if (Array.isArray(input)) {
    input.forEach(add);
    return [...urls];
  }

  if (typeof input === "object") {
    const obj = input as {
      data?: unknown[] | unknown;
    };

    if (Array.isArray(obj.data)) {
      obj.data.forEach(add);
      return [...urls];
    }

    if (obj.data) {
      add(obj.data);
      return [...urls];
    }
  }

  add(input);
  return [...urls];
}

// Funcție pentru a converti rich-text în string simplu
function extractTextFromRichText(
  richText: HomepageRichTextBlock,
): string | null {
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
        const raw = result?.data as HomepageCmsEntry | null;
        if (!raw) throw new Error("Homepage: răspuns gol (data lipsă)");
        // Strapi v5: { data: { id, attributes: {...} } }
        const attrs: Record<string, unknown> = raw.attributes
          ? (raw.attributes as Record<string, unknown>)
          : (raw as unknown as Record<string, unknown>);
        const a = attrs as HomepageCmsAttributes;

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
          impactGalleryImages: resolveMediaList(
            a.impactGalleryImages,
            effectiveMediaOrigin,
            1600,
          ),
          teamTitle: a.teamTitle ?? null,
          teamDescription: extractTextFromRichText(a.teamDescription),
          teamImages: resolveMediaList(
            a.teamImages,
            effectiveMediaOrigin,
            1200,
          ),
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
          impactGalleryImages: [],
          teamTitle: "Echipa noastră",
          teamDescription: "Oameni dedicați unei cauze nobile.",
          teamImages: [],
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
