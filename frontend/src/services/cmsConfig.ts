const DEV_PORTS = new Set(["5173", "5174", "3000"]);

export interface CmsApiConfig {
  apiBase: string;
  mediaOrigin: string;
}

export function resolveCmsApiConfig(): CmsApiConfig {
  const isBrowser = typeof window !== "undefined";
  const envBase = (import.meta.env.VITE_API_CMS_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "");

  let apiBase = envBase;
  if (!apiBase) {
    if (isBrowser && DEV_PORTS.has(window.location.port)) {
      apiBase = "/api";
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
