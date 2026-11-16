import {
  addColorSchemeChangeListener,
  getColorScheme,
  type KksiazekColorScheme,
} from "kksiazek-system-theme";
import { useEffect, useState } from "react";

export function useSystemTheme(): KksiazekColorScheme {
  const [colorScheme, setColorScheme] = useState<KksiazekColorScheme>(() => getColorScheme());

  useEffect(() => {
    setColorScheme(getColorScheme());

    const subscription = addColorSchemeChangeListener((event) => {
      console.log("🩵 [useSystemTheme] colorScheme changed to", event.colorScheme);

      setColorScheme(event.colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return colorScheme;
}
