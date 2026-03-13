import { useEffect } from "react";
import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SEO_DESCRIPTION,
  SEO_APP_NAME,
  toAbsoluteUrl,
} from "../../utils/seo";

type JsonLdValue = object | object[];

interface MetaProps {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: string;
  ogImageAlt?: string;
  jsonLd?: JsonLdValue;
}

export function Meta({
  title,
  description,
  canonical,
  noIndex,
  ogImage,
  ogType = "website",
  ogImageAlt,
  jsonLd,
}: MetaProps) {
  useEffect(() => {
    const resolvedTitle = title
      ? title.includes(SEO_APP_NAME)
        ? title
        : `${title} • ${SEO_APP_NAME}`
      : SEO_APP_NAME;
    const resolvedDescription = description || DEFAULT_SEO_DESCRIPTION;
    const resolvedCanonical =
      canonical ||
      (typeof window !== "undefined" ? window.location.href : undefined);
    const resolvedImage = toAbsoluteUrl(ogImage || DEFAULT_OG_IMAGE_PATH);

    document.title = resolvedTitle;

    function setMeta(name: string, content?: string) {
      let el = document.querySelector(
        `meta[name="${name}"]`,
      ) as HTMLMetaElement | null;
      if (!content) {
        el?.remove();
        return;
      }
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }
    function setProperty(property: string, content?: string) {
      let el = document.querySelector(
        `meta[property="${property}"]`,
      ) as HTMLMetaElement | null;
      if (!content) {
        el?.remove();
        return;
      }
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }

    setMeta("description", resolvedDescription);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    if (resolvedCanonical) {
      let link = document.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = resolvedCanonical;
    } else {
      document.querySelector('link[rel="canonical"]')?.remove();
    }

    const ogTitle = resolvedTitle;
    setProperty("og:title", ogTitle);
    setProperty("og:description", resolvedDescription);
    setProperty("og:image", resolvedImage);
    setProperty("og:image:alt", ogImageAlt || resolvedTitle);
    setProperty("og:site_name", SEO_APP_NAME);
    if (ogType) setProperty("og:type", ogType);
    setProperty("og:url", resolvedCanonical);
    setProperty("og:locale", "ro_RO");

    setMeta("twitter:card", resolvedImage ? "summary_large_image" : "summary");
    setMeta("twitter:title", resolvedTitle);
    setMeta("twitter:description", resolvedDescription);
    setMeta("twitter:image", resolvedImage);
    setMeta("twitter:image:alt", ogImageAlt || resolvedTitle);

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
        2,
      );
      if (!existing) document.head.appendChild(script as HTMLScriptElement);
    } else if (existing) {
      existing.remove();
    }
  }, [
    title,
    description,
    canonical,
    noIndex,
    ogImage,
    ogType,
    ogImageAlt,
    jsonLd,
  ]);
  return null;
}
