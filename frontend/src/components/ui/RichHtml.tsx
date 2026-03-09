import { sanitizeMapEmbedHtml, sanitizeRichHtml } from "../../utils/content";

interface RichHtmlProps {
  html?: string | null;
  className?: string;
  mode?: "rich" | "map";
}

export function RichHtml({ html, className, mode = "rich" }: RichHtmlProps) {
  const sanitized =
    mode === "map" ? sanitizeMapEmbedHtml(html) : sanitizeRichHtml(html);
  if (!sanitized) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
