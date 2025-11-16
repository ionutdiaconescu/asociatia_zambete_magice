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
        const apiUrl =
          (import.meta.env.VITE_API_CMS_URL as string | undefined) ||
          "http://localhost:1337/api";
        const origin = apiUrl.replace(/\/api$/, "");
        const response = await fetch(`${apiUrl}/homepage?populate=*`);
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
          heroBackgroundMedia?: unknown;
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

        // Helper pentru media: acceptă string, object {url}, {data:{attributes:{url}}} sau array
        const mediaUrl = (m: unknown): string | null => {
          if (!m) return null;
          if (typeof m === "string") {
            return m.startsWith("http") ? m : `${origin}${m}`;
          }
          if (Array.isArray(m)) {
            const first = (m as unknown[])[0];
            return mediaUrl(first);
          }
          if (typeof m === "object") {
            const mo = m as {
              url?: string;
              data?: { attributes?: { url?: string } };
            };
            if (mo.url)
              return mo.url.startsWith("http") ? mo.url : `${origin}${mo.url}`;
            const url = mo.data?.attributes?.url;
            return url
              ? url.startsWith("http")
                ? url
                : `${origin}${url}`
              : null;
          }
          return null;
        };

        console.log("[Homepage] Raw attributes:", JSON.stringify(a, null, 2));
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
          heroBackgroundImage: mediaUrl(a.heroBackgroundMedia),
          statsYearsActive: Number(a.statsYearsActive ?? 0),
          statsTotalBeneficiaries: Number(a.statsTotalBeneficiaries ?? 0),
          statsCompletedProjects: Number(a.statsCompletedProjects ?? 0),
          statsActiveVolunteers: Number(a.statsActiveVolunteers ?? 0),
          howWeWorkTitle: a.howWeWorkTitle ?? null,
          howWeWorkDescription: extractTextFromRichText(a.howWeWorkDescription),
          impactGalleryTitle: a.impactGalleryTitle ?? null,
          impactGalleryDescription: extractTextFromRichText(
            a.impactGalleryDescription
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
          JSON.stringify(processedData, null, 2)
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
