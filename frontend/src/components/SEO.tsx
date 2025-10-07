import { useEffect } from "react";

interface SEOProps {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  /** Default canonical can be added in future */
}

export function SEO({ title, description, image }: SEOProps) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    const ensureMeta = (name: string, attr: "name" | "property" = "name") => {
      let tag = document.querySelector<HTMLMetaElement>(
        `meta[${attr}='${name}']`
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      return tag;
    };

    if (description) {
      ensureMeta("description").setAttribute("content", description);
      ensureMeta("og:description", "property").setAttribute(
        "content",
        description
      );
      ensureMeta("twitter:description").setAttribute("content", description);
    }
    if (title) {
      ensureMeta("og:title", "property").setAttribute("content", title);
      ensureMeta("twitter:title").setAttribute("content", title);
    }
    if (image) {
      ensureMeta("og:image", "property").setAttribute("content", image);
      ensureMeta("twitter:image").setAttribute("content", image);
      ensureMeta("twitter:card").setAttribute("content", "summary_large_image");
    }
    ensureMeta("og:type", "property").setAttribute("content", "website");
  }, [title, description, image]);

  return null;
}
