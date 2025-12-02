import type { StaticPage } from "../types/page";

// Pin API base to dev proxy path to avoid hitting 10000
const API_BASE = "/api";

interface StrapiPageAttr {
  title?: string;
  slug?: string;
  body?: string;
  content?: string;
  updatedAt?: string;
  publishedAt?: string;
  heroImage?: any;
  gallery?: any;
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

function mapPage(e: StrapiEntry<StrapiPageAttr>): StaticPage {
  const a = e.attributes || {};
  const hero = a.heroImage?.data?.attributes?.url as string | undefined;
  const galleryArr = Array.isArray(a.gallery?.data) ? a.gallery.data : [];
  const galleryUrls = galleryArr
    .map((d: any) => d?.attributes?.url)
    .filter(Boolean)
    // Keep relative "/uploads"; Vite proxy forwards to Strapi in dev
    .map((u: string) => (u.startsWith("http") ? u : u));
  return {
    id: String(e.id),
    slug: a.slug || String(e.id),
    title: a.title || "Fără titlu",
    body: a.body || a.content || "",
    updatedAt: a.updatedAt || a.publishedAt,
    heroImageUrl: hero ? (hero.startsWith("http") ? hero : hero) : null,
    galleryUrls,
    address: a.address,
    phone: a.phone,
    email: a.email,
  };
}

async function fetchSingleType(path: string): Promise<StaticPage> {
  const res = await safeFetch(`${API_BASE}/${path}?populate=*`);
  const e = res?.data as StrapiEntry<StrapiPageAttr> | undefined;
  if (!e) throw new Error("Pagină negăsită");
  const a = e.attributes || {};
  const hero = a.heroImage?.data?.attributes?.url as string | undefined;
  const galleryArr = Array.isArray(a.gallery?.data) ? a.gallery.data : [];
  const galleryUrls = galleryArr
    .map((d: any) => d?.attributes?.url)
    .filter(Boolean)
    .map((u: string) => (u.startsWith("http") ? u : u));
  return {
    id: String(e.id ?? path),
    slug: path,
    title: a.title || (path === "about" ? "Despre noi" : "Contact"),
    body: a.body || a.content || "",
    updatedAt: a.updatedAt || a.publishedAt,
    heroImageUrl: hero ? (hero.startsWith("http") ? hero : hero) : null,
    galleryUrls,
    address: a.address,
    phone: a.phone,
    email: a.email,
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
