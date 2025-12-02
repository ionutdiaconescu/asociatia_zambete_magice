import type { StaticPage } from "../types/page";

const devPorts = new Set(["5173", "5174", "3000"]);

function resolveApiConfig() {
  const isBrowser = typeof window !== "undefined";
  const envBase = (import.meta.env.VITE_API_CMS_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "");
  let apiBase = envBase;
  if (!apiBase) {
    if (isBrowser && devPorts.has(window.location.port)) {
      apiBase = "/api"; // use Vite proxy in dev
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

const { apiBase: API_BASE, mediaOrigin: MEDIA_ORIGIN } = resolveApiConfig();

type MediaLike =
  | {
      data?: {
        attributes?: {
          url?: string;
        };
      };
      attributes?: { url?: string };
      url?: string;
    }
  | null
  | undefined;

interface StrapiPageAttr {
  title?: string;
  slug?: string;
  body?: string;
  content?: string;
  updatedAt?: string;
  publishedAt?: string;
  heroImage?: MediaLike;
  gallery?: { data?: MediaLike[] } | MediaLike[] | null;
  address?: string;
  phone?: string;
  email?: string;
}
interface StrapiEntry<T> {
  id: number | string;
  attributes?: T;
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const toAbsolute = (url?: string | null): string | null => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${MEDIA_ORIGIN}${url}`;
};

const onlyStrings = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.length > 0;

const extractMediaUrl = (media?: MediaLike): string | undefined => {
  if (!media) return undefined;
  if (media.data?.attributes?.url) return media.data.attributes.url;
  if (media.attributes?.url) return media.attributes.url;
  return media.url;
};

const normalizeGallery = (
  gallery?: { data?: MediaLike[] } | MediaLike[] | null
): MediaLike[] => {
  if (!gallery) return [];
  if (Array.isArray(gallery)) return gallery;
  if (Array.isArray(gallery.data)) return gallery.data;
  return [];
};

function mapPage(e: StrapiEntry<StrapiPageAttr>): StaticPage {
  const rawAttrs = e.attributes
    ? (e.attributes as StrapiPageAttr)
    : (e as unknown as StrapiPageAttr) || {};
  const hero = extractMediaUrl(rawAttrs.heroImage);
  const galleryUrls = normalizeGallery(rawAttrs.gallery)
    .map((media) => extractMediaUrl(media))
    .filter(onlyStrings)
    .map((u) => toAbsolute(u) ?? u)
    .filter(onlyStrings);
  return {
    id: String(e.id),
    slug: rawAttrs.slug || String(e.id),
    title: rawAttrs.title || "Fără titlu",
    body: rawAttrs.body || rawAttrs.content || "",
    updatedAt: rawAttrs.updatedAt || rawAttrs.publishedAt,
    heroImageUrl: toAbsolute(hero),
    galleryUrls,
    address: rawAttrs.address,
    phone: rawAttrs.phone,
    email: rawAttrs.email,
  };
}

async function fetchSingleType(path: string): Promise<StaticPage> {
  const res = await safeFetch(`${API_BASE}/${path}?populate=*`);
  const e = res?.data as StrapiEntry<StrapiPageAttr> | undefined;
  if (!e) throw new Error("Pagină negăsită");
  const attrs = e.attributes
    ? (e.attributes as StrapiPageAttr)
    : (e as unknown as StrapiPageAttr) || {};
  const hero = extractMediaUrl(attrs.heroImage);
  const galleryUrls = normalizeGallery(attrs.gallery)
    .map((media) => extractMediaUrl(media))
    .filter(onlyStrings)
    .map((u) => toAbsolute(u) ?? u)
    .filter(onlyStrings);
  return {
    id: String(e.id ?? path),
    slug: path,
    title: attrs.title || (path === "about" ? "Despre noi" : "Contact"),
    body: attrs.body || attrs.content || "",
    updatedAt: attrs.updatedAt || attrs.publishedAt,
    heroImageUrl: toAbsolute(hero),
    galleryUrls,
    address: attrs.address,
    phone: attrs.phone,
    email: attrs.email,
  };
}

export async function fetchPage(slug: string): Promise<StaticPage> {
  try {
    // Use single types for about/contact
    if (slug === "about" || slug === "contact") {
      return await fetchSingleType(slug);
    }
    // Fallback to collection type 'pages' for other slugs
    const res = await safeFetch(
      `${API_BASE}/pages?filters[slug][$eq]=${encodeURIComponent(slug)}`
    );
    if (res?.data?.length) return mapPage(res.data[0]);
    throw new Error("Pagină negăsită");
  } catch (e) {
    console.warn("Fallback static page", e);
    return {
      id: slug,
      slug,
      title:
        slug === "about" ? "Despre noi" : slug === "contact" ? "Contact" : slug,
      body:
        slug === "about"
          ? "Conținutul paginii despre noi va fi disponibil în curând."
          : slug === "contact"
          ? "Conținutul paginii de contact va fi disponibil în curând."
          : "Această pagină va fi disponibilă în curând.",
      updatedAt: new Date().toISOString(),
    };
  }
}
