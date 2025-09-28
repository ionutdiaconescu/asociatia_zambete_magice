import { useEffect } from "react";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

interface MetaProps {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: string;
  jsonLd?: JsonLdValue;
}

const APP_NAME = "Zâmbete Magice";

export function Meta({
  title,
  description,
  canonical,
  noIndex,
  ogImage,
  ogType = "website",
  jsonLd,
}: MetaProps) {
  useEffect(() => {
    if (title) {
      document.title = title.includes(APP_NAME)
        ? title
        : `${title} • ${APP_NAME}`;
    }
    function setMeta(name: string, content?: string) {
      if (!content) return;
      let el = document.querySelector(
        `meta[name="${name}"]`
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }
    function setProperty(property: string, content?: string) {
      if (!content) return;
      let el = document.querySelector(
        `meta[property="${property}"]`
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }
    if (description) setMeta("description", description);
    if (canonical) {
      let link = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
    if (noIndex) setMeta("robots", "noindex, nofollow");
    const ogTitle = title
      ? title.includes(APP_NAME)
        ? title
        : `${title} • ${APP_NAME}`
      : APP_NAME;
    setProperty("og:title", ogTitle);
    if (description) setProperty("og:description", description);
    if (ogImage) setProperty("og:image", ogImage);
    setProperty("og:site_name", APP_NAME);
    if (ogType) setProperty("og:type", ogType);

    // JSON-LD structured data
    const existing = document.getElementById("app-jsonld");
    if (jsonLd) {
      const script =
        (existing as HTMLScriptElement) || document.createElement("script");
      (script as HTMLScriptElement).type = "application/ld+json";
      script.id = "app-jsonld";
      (script as HTMLScriptElement).textContent = JSON.stringify(
        jsonLd,
        null,
        2
      );
      if (!existing) document.head.appendChild(script as HTMLScriptElement);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, canonical, noIndex, ogImage, ogType, jsonLd]);
  return null;
}
