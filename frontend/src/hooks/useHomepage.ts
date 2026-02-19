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
        const envBase = (
          import.meta.env.VITE_API_CMS_URL as string | undefined
        )?.replace(/\/$/, "");
        const isBrowser = typeof window !== "undefined";
        const devPorts = new Set(["5173", "5174", "3000"]);
        let apiBase = envBase;
        if (!apiBase) {
          if (isBrowser && devPorts.has(window.location.port)) {
            apiBase = "/api"; // rely on Vite proxy in dev
          } else if (
            isBrowser &&
            /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
          ) {
            apiBase = `http://${window.location.hostname}:1337/api`;
          } else {
            apiBase = "http://localhost:1337/api";
          }
        }
        if (!/\/api$/.test(apiBase)) {
          apiBase = `${apiBase.replace(/\/$/, "")}/api`;
        }
        const apiUrl = `${apiBase}/homepage?populate=*`;
        const origin = apiBase.startsWith("http")
          ? apiBase.replace(/\/api$/, "")
          : isBrowser
            ? window.location.origin
            : "";
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
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

        // Helper media: preferă formatul cu lățimea cea mai apropiată de target (ex: 1600) dacă există.
        const mediaUrl = (m: unknown, targetWidth = 1600): string | null => {
          const absolutize = (raw?: string | null): string | null => {
            if (!raw) return null;
            if (raw.startsWith("http://") || raw.startsWith("https://")) {
              return raw;
            }
            return origin ? `${origin}${raw}` : raw;
          };

          if (!m) return null;
          if (typeof m === "string") {
            return absolutize(m);
          }
          if (Array.isArray(m)) {
            return mediaUrl((m as unknown[])[0], targetWidth);
          }
          if (typeof m === "object") {
            const mo = m as {
              url?: string;
              attributes?: {
                url?: string;
                formats?: Record<
                  string,
                  { url?: string; width?: number; height?: number }
                >;
              };
              data?: {
                url?: string;
                formats?: Record<
                  string,
                  { url?: string; width?: number; height?: number }
                >;
                attributes?: {
                  url?: string;
                  formats?: Record<
                    string,
                    { url?: string; width?: number; height?: number }
                  >;
                };
              };
            };
            // Dacă avem data.attributes.formats alege cel mai potrivit format.
            const formats =
              mo.data?.formats ||
              mo.data?.attributes?.formats ||
              mo.attributes?.formats;
            if (formats && typeof formats === "object") {
              const candidates = Object.values(formats).filter(Boolean) as {
                url?: string;
                width?: number;
              }[];
              if (candidates.length) {
                // Sortează după |width - targetWidth| ascendent.
                candidates.sort((a, b) => {
                  const aw = a.width ?? 0;
                  const bw = b.width ?? 0;
                  return (
                    Math.abs(aw - targetWidth) - Math.abs(bw - targetWidth)
                  );
                });
                const picked = candidates[0];
                if (picked?.url) {
                  return absolutize(picked.url);
                }
              }
            }
            // Fallback la url direct.
            const rawUrl =
              mo.url ||
              mo.attributes?.url ||
              mo.data?.url ||
              mo.data?.attributes?.url;
            return absolutize(rawUrl);
          }
          return null;
        };

        console.log("[Homepage] Raw attributes:", JSON.stringify(a, null, 2));
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
          heroBackgroundImage: mediaUrl(heroBgSource),
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
          seoSocialImage: mediaUrl(a.seoSocialImage),
        };
        console.log(
          "[Homepage] Processed data:",
          JSON.stringify(processedData, null, 2),
        );
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
