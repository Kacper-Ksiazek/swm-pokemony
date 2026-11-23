import { theme } from "@/components/theme";

export const FORM_FIELDS = [
  { key: "name", label: "Trainer name", placeholder: "Ash Ketchum" },
  { key: "region", label: "Region", placeholder: "Kanto" },
  { key: "starter", label: "Starter Pokémon", placeholder: "Pikachu" },
  { key: "badge", label: "Favorite badge", placeholder: "Cascade Badge" },
  { key: "notes", label: "Notes", placeholder: "Strategy or team notes…", multiline: true },
] as const;

export const TOOLBAR_BG = "#E2E4E9";
export const TOOLBAR_BORDER = "#C5C8D0";

export const TOOLBAR_THEME = {
  light: {
    primary: theme.colors.accent,
    disabled: "#9CA3AF",
    background: TOOLBAR_BG,
    ripple: "#D1D5DB",
  },
  dark: {
    primary: theme.colors.accent,
    disabled: "#9CA3AF",
    background: TOOLBAR_BG,
    ripple: "#D1D5DB",
  },
};
