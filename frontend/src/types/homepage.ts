export interface HomepageData {
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
  impactGalleryImages: string[];
  teamTitle: string | null;
  teamDescription: string | null;
  teamImages: string[];
  transparencyTitle: string | null;
  donationIban?: string | null;
  donationBankName?: string | null;
  donationBeneficiaryName?: string | null;
  donationInstructions?: string | null;
  donationReferenceHint?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoSocialImage?: string | null;
}

export interface HomepageRichTextChild {
  type?: string;
  text?: string;
  children?: HomepageRichTextChild[];
}

export interface HomepageRichTextObject {
  children?: HomepageRichTextChild[];
}

export type HomepageRichTextBlock =
  | HomepageRichTextObject
  | string
  | HomepageRichTextBlock[]
  | null
  | undefined;

export interface HomepageCmsEntry {
  id?: number | string;
  attributes?: Record<string, unknown>;
  documentId?: string;
}

export interface HomepageCmsAttributes {
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: HomepageRichTextBlock;
  heroBackgroundMedia?: unknown;
  heroBackgroundImage?: unknown;
  heroBackground?: unknown;
  heroCtaText?: string | null;
  heroCtaLink?: string | null;
  statsYearsActive?: number;
  statsTotalBeneficiaries?: number;
  statsCompletedProjects?: number;
  statsActiveVolunteers?: number;
  howWeWorkTitle?: string | null;
  howWeWorkDescription?: HomepageRichTextBlock;
  impactGalleryTitle?: string | null;
  impactGalleryDescription?: HomepageRichTextBlock;
  impactGalleryImages?: unknown;
  teamTitle?: string | null;
  teamDescription?: HomepageRichTextBlock;
  teamImages?: unknown;
  transparencyTitle?: string | null;
  donationIban?: string | null;
  donationBankName?: string | null;
  donationBeneficiaryName?: string | null;
  donationInstructions?: HomepageRichTextBlock;
  donationReferenceHint?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoSocialImage?: unknown;
}
