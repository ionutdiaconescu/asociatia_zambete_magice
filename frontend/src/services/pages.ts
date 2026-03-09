import type { StaticPage } from "../types/page";
import { resolveCmsApiConfig } from "./cmsConfig";
import { resolveMediaUrl } from "./cmsMedia";

const { apiBase: API_BASE, mediaOrigin: MEDIA_ORIGIN } = resolveCmsApiConfig();

type MediaLike = unknown;

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
  mapEmbed?: string;
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

const onlyStrings = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.length > 0;

const normalizeGallery = (
  gallery?: { data?: MediaLike[] } | MediaLike[] | null,
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
  const hero = resolveMediaUrl(rawAttrs.heroImage, MEDIA_ORIGIN, 1920);
  const galleryUrls = normalizeGallery(rawAttrs.gallery)
    .map((media) => resolveMediaUrl(media, MEDIA_ORIGIN, 1600))
    .filter(onlyStrings)
    .filter(onlyStrings);
  return {
    id: String(e.id),
    slug: rawAttrs.slug || String(e.id),
    title: rawAttrs.title || "Fără titlu",
    body: rawAttrs.body || rawAttrs.content || "",
    updatedAt: rawAttrs.updatedAt || rawAttrs.publishedAt,
    heroImageUrl: hero,
    galleryUrls,
    address: rawAttrs.address,
    phone: rawAttrs.phone,
    email: rawAttrs.email,
    mapEmbed: rawAttrs.mapEmbed,
  };
}

async function fetchSingleType(path: string): Promise<StaticPage> {
  const res = await safeFetch(`${API_BASE}/${path}?populate=*`);
  const e = res?.data as StrapiEntry<StrapiPageAttr> | undefined;
  if (!e) throw new Error("Pagină negăsită");
  const attrs = e.attributes
    ? (e.attributes as StrapiPageAttr)
    : (e as unknown as StrapiPageAttr) || {};
  const hero = resolveMediaUrl(attrs.heroImage, MEDIA_ORIGIN, 1920);
  const galleryUrls = normalizeGallery(attrs.gallery)
    .map((media) => resolveMediaUrl(media, MEDIA_ORIGIN, 1600))
    .filter(onlyStrings)
    .filter(onlyStrings);
  return {
    id: String(e.id ?? path),
    slug: path,
    title: attrs.title || (path === "about" ? "Despre noi" : "Contact"),
    body: attrs.body || attrs.content || "",
    updatedAt: attrs.updatedAt || attrs.publishedAt,
    heroImageUrl: hero,
    galleryUrls,
    address: attrs.address,
    phone: attrs.phone,
    email: attrs.email,
    mapEmbed: attrs.mapEmbed,
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
      `${API_BASE}/pages?filters[slug][$eq]=${encodeURIComponent(slug)}`,
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
