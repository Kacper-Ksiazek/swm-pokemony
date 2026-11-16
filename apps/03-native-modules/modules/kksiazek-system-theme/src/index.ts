import type { KksiazekColorSchemeChangeEvent } from "./KksiazekSystemTheme.types";
import KksiazekSystemTheme from "./KksiazekSystemThemeModule";

export type {
  KksiazekColorScheme,
  KksiazekColorSchemeChangeEvent,
} from "./KksiazekSystemTheme.types";

export function getColorScheme() {
  console.log("🩵 [kksiazek-system-theme] getColorScheme()");

  return KksiazekSystemTheme.getColorScheme();
}

export function addColorSchemeChangeListener(
  listener: (event: KksiazekColorSchemeChangeEvent) => void,
) {
  console.log("🩵 [kksiazek-system-theme] addColorSchemeChangeListener()");

  return KksiazekSystemTheme.addListener("onColorSchemeChange", listener);
}
