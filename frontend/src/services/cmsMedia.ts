type MediaFormats = Record<string, { url?: string; width?: number }>;

export function absolutizeMediaUrl(
  raw: string | null | undefined,
  origin: string,
): string | null {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (!origin) return raw;
  if (raw.startsWith("/")) return `${origin}${raw}`;
  return `${origin}/${raw}`;
}

function pickPreferredFormatUrl(
  formats: MediaFormats | undefined,
  targetWidth: number,
): string | null {
  if (!formats || typeof formats !== "object") return null;
  const candidates = Object.values(formats).filter(
    (f): f is { url: string; width?: number } => !!f?.url,
  );
  if (!candidates.length) return null;

  // Ignore tiny derivatives (e.g. thumbnail 156px) for large targets like hero backgrounds.
  // If no candidate passes this threshold, caller should fall back to original media URL.
  const minUsefulWidth = Math.max(320, Math.floor(targetWidth * 0.45));
  const viable = candidates.filter(
    (c) => typeof c.width !== "number" || c.width >= minUsefulWidth,
  );
  const pool = viable.length > 0 ? viable : [];
  if (!pool.length) return null;

  pool.sort((a, b) => {
    const aw = a.width ?? 0;
    const bw = b.width ?? 0;
    return Math.abs(aw - targetWidth) - Math.abs(bw - targetWidth);
  });

  return pool[0]?.url ?? null;
}

export function resolveMediaUrl(
  input: unknown,
  origin: string,
  targetWidth = 1600,
): string | null {
  if (!input) return null;

  if (typeof input === "string") {
    return absolutizeMediaUrl(input, origin);
  }

  if (Array.isArray(input)) {
    return resolveMediaUrl(input[0], origin, targetWidth);
  }

  if (typeof input !== "object") return null;

  const media = input as {
    url?: string;
    formats?: MediaFormats;
    attributes?: {
      url?: string;
      formats?: MediaFormats;
    };
    data?:
      | {
          url?: string;
          formats?: MediaFormats;
          attributes?: {
            url?: string;
            formats?: MediaFormats;
          };
        }
      | Array<{
          url?: string;
          attributes?: {
            url?: string;
            formats?: MediaFormats;
          };
        }>;
  };

  const fromDataArray = Array.isArray(media.data)
    ? resolveMediaUrl(media.data[0], origin, targetWidth)
    : null;
  if (fromDataArray) return fromDataArray;

  const formatUrl = pickPreferredFormatUrl(
    media.formats ||
      media.attributes?.formats ||
      (!Array.isArray(media.data)
        ? media.data?.formats || media.data?.attributes?.formats
        : undefined),
    targetWidth,
  );
  if (formatUrl) return absolutizeMediaUrl(formatUrl, origin);

  const rawUrl =
    media.url ||
    media.attributes?.url ||
    (!Array.isArray(media.data) ? media.data?.url : undefined) ||
    (!Array.isArray(media.data) ? media.data?.attributes?.url : undefined);

  return absolutizeMediaUrl(rawUrl, origin);
}
