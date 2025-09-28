// Utility helpers for building canonical URLs and JSON-LD objects

export function buildCanonical(path: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const base = window.location.origin.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
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
    image: params.image,
    url: params.url,
    dateModified: params.dateModified,
  };
}

export function buildOrganization(base?: { logo?: string; sameAs?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zâmbete Magice",
    url: typeof window !== "undefined" ? window.location.origin : undefined,
    logo: base?.logo,
    sameAs: base?.sameAs || [],
  };
}

export function buildWebsite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zâmbete Magice",
    url: typeof window !== "undefined" ? window.location.origin : undefined,
  };
}
