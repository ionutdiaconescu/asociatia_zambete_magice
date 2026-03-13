// Utility helpers for building canonical URLs and JSON-LD objects

export const SEO_APP_NAME = "Zambete Magice";
export const SEO_ORGANIZATION_NAME = "Asociatia Zambete Magice";
export const DEFAULT_SEO_DESCRIPTION =
  "Asociatia Zambete Magice sprijina copiii prin campanii umanitare, proiecte educationale si interventii sociale cu impact real.";
export const DEFAULT_OG_IMAGE_PATH = "/icon-1200X600.png";

export function getSiteOrigin(): string | undefined {
  const envSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "");

  if (envSiteUrl) return envSiteUrl;
  if (typeof window === "undefined") return undefined;
  return window.location.origin.replace(/\/$/, "");
}

export function toAbsoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const origin = getSiteOrigin();
  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}

export function buildCanonical(path: string): string | undefined {
  return toAbsoluteUrl(path);
}

export function buildWebPageMeta(params: {
  title: string;
  path: string;
  description?: string;
  image?: string;
  dateModified?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
}) {
  const canonical = buildCanonical(params.path);

  return {
    canonical,
    jsonLd: buildWebPage({
      name: params.title,
      description: params.description,
      image: params.image,
      url: canonical,
      dateModified: params.dateModified,
      type: params.type,
    }),
  };
}

export interface JsonLdCreativeWork {
  "@context": "https://schema.org";
  "@type": "CreativeWork";
  name: string;
  description?: string;
  image?: string;
  url?: string;
  dateModified?: string;
}

export function buildCreativeWork(params: {
  name: string;
  description?: string;
  image?: string;
  dateModified?: string;
  url?: string;
}): JsonLdCreativeWork {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: params.name,
    description: params.description,
    image: toAbsoluteUrl(params.image),
    url: toAbsoluteUrl(params.url),
    dateModified: params.dateModified,
  };
}

export function buildCreativeWorkMeta(params: {
  title: string;
  path: string;
  description?: string;
  image?: string;
  dateModified?: string;
}) {
  const canonical = buildCanonical(params.path);

  return {
    canonical,
    jsonLd: buildCreativeWork({
      name: params.title,
      description: params.description,
      image: params.image,
      dateModified: params.dateModified,
      url: canonical,
    }),
  };
}

export interface JsonLdWebPage {
  "@context": "https://schema.org";
  "@type": string;
  name: string;
  description?: string;
  image?: string;
  url?: string;
  dateModified?: string;
}

export function buildWebPage(params: {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  dateModified?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
}): JsonLdWebPage {
  return {
    "@context": "https://schema.org",
    "@type": params.type || "WebPage",
    name: params.name,
    description: params.description,
    image: toAbsoluteUrl(params.image),
    url: toAbsoluteUrl(params.url),
    dateModified: params.dateModified,
  };
}

export function buildOrganization(base?: { logo?: string; sameAs?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_ORGANIZATION_NAME,
    url: getSiteOrigin(),
    logo: toAbsoluteUrl(base?.logo),
    sameAs: base?.sameAs || [],
  };
}

export function buildWebsite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_ORGANIZATION_NAME,
    url: getSiteOrigin(),
  };
}
