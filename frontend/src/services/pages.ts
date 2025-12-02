import type { StaticPage } from "../types/page";

const API_BASE = import.meta.env.VITE_API_CMS_URL || "/api";

interface StrapiPageAttr {
  title?: string;
  slug?: string;
  body?: string;
  content?: string;
  updatedAt?: string;
  publishedAt?: string;
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
  return {
    id: String(e.id),
    slug: a.slug || String(e.id),
    title: a.title || "Fără titlu",
    body: a.body || a.content || "",
    updatedAt: a.updatedAt || a.publishedAt,
  };
}

async function fetchSingleType(path: string): Promise<StaticPage> {
  const res = await safeFetch(`${API_BASE}/${path}`);
  const e = res?.data as StrapiEntry<StrapiPageAttr> | undefined;
  if (!e) throw new Error("Pagină negăsită");
  const a = e.attributes || {};
  return {
    id: String(e.id ?? path),
    slug: path,
    title: a.title || (path === "about" ? "Despre noi" : "Contact"),
    body: a.body || a.content || "",
    updatedAt: a.updatedAt || a.publishedAt,
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
