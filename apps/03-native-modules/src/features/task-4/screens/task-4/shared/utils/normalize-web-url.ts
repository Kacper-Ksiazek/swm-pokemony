const HTTP_URL = /^https?:\/\//i;

export const DEFAULT_WEB_URL = "https://expo.dev/";

export const WEBVIEW_PRESETS = [
  { label: "expo.dev", url: "https://expo.dev" },
  { label: "pokeapi.co", url: "https://pokeapi.co" },
] as const;

export function normalizeWebUrl(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const withScheme = HTTP_URL.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
