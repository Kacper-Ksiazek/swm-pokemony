export type KksiazekColorScheme = "light" | "dark";

export type KksiazekColorSchemeChangeEvent = {
  colorScheme: KksiazekColorScheme;
};

export type KksiazekSystemThemeModuleEvents = {
  onColorSchemeChange: (event: KksiazekColorSchemeChangeEvent) => void;
};
