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
          import.meta.env.VITE_API_BASE_URL || "http://localhost:1337/api";
        const response = await fetch(`${apiUrl}/homepage?populate=*`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        console.log(
          "[Homepage] Raw data from Strapi:",
          JSON.stringify(result.data, null, 2)
        );
        const processedData: HomepageData = {
          ...result.data,
          heroDescription: extractTextFromRichText(result.data.heroDescription),
          howWeWorkDescription: extractTextFromRichText(
            result.data.howWeWorkDescription
          ),
          impactGalleryDescription: extractTextFromRichText(
            result.data.impactGalleryDescription
          ),
          teamDescription: extractTextFromRichText(result.data.teamDescription),
          heroBackgroundImage: result.data.heroBackgroundMedia?.url
            ? `http://localhost:1337${result.data.heroBackgroundMedia.url}`
            : null,
          donationIban: result.data.donationIban || null,
          donationBankName: result.data.donationBankName || null,
          donationBeneficiaryName: result.data.donationBeneficiaryName || null,
          donationInstructions: extractTextFromRichText(
            result.data.donationInstructions
          ),
          donationReferenceHint: result.data.donationReferenceHint || null,
          seoTitle: result.data.seoTitle || null,
          seoDescription: result.data.seoDescription || null,
          seoSocialImage: result.data.seoSocialImage?.url
            ? `http://localhost:1337${result.data.seoSocialImage.url}`
            : null,
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
