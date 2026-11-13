import { NativeModule, requireNativeModule } from "expo";

import type {
  KksiazekColorScheme,
  KksiazekSystemThemeModuleEvents,
} from "./KksiazekSystemTheme.types";

declare class KksiazekSystemThemeModule extends NativeModule<KksiazekSystemThemeModuleEvents> {
  getColorScheme(): KksiazekColorScheme;
}

export default requireNativeModule<KksiazekSystemThemeModule>("KksiazekSystemTheme");
