import type { ReactNode } from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { ColorsContext } from "./colors-context";

export function ColorsProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return <ColorsContext.Provider value={colors}>{children}</ColorsContext.Provider>;
}
