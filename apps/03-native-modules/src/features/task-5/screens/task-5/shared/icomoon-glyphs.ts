import selection from "../../../../../../assets/fonts/icomoon/selection.json";

export const ICOMOON_FONT_FAMILY = selection.preferences.fontPref.metadata.fontFamily;
export const ICOMOON_VIEWBOX_SIZE = selection.height;

export const ICOMOON_GLYPHS = Object.fromEntries(
  selection.icons.map((entry) => [entry.properties.name, entry.properties.code]),
) as Record<string, number>;

export const ICOMOON_SVG_PATHS = Object.fromEntries(
  selection.icons.map((entry) => [entry.properties.name, entry.icon.paths]),
) as Record<string, string[]>;

export const ICOMOON_ICON_NAMES = selection.icons.map((entry) => entry.properties.name);

export function getIcomoonGlyph(name: string): string {
  const code = ICOMOON_GLYPHS[name];
  if (code === undefined) {
    return "?";
  }
  return String.fromCharCode(code);
}

export function formatCodePoint(code: number): string {
  return `U+${code.toString(16).toUpperCase()}`;
}
