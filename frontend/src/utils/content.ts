export function stripHtmlTags(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeRichHtml(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "");
}

export function sanitizeMapEmbedHtml(value?: string | null): string {
  if (!isSafeMapEmbed(value)) return "";
  return sanitizeRichHtml(value);
}

export function excerptFromHtml(value: string, maxLength = 160): string {
  const text = stripHtmlTags(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

export function isSafeMapEmbed(value?: string | null): boolean {
  if (!value) return false;
  return /<iframe/i.test(value) && /google\.com\/maps/i.test(value);
}
