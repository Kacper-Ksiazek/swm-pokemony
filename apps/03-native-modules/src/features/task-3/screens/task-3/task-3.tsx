import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReferenceThemePanel } from "./reference";
import { type ThemeLabSource, ThemeLabSourceTabs } from "./shared";
import { SolutionThemePanel } from "./solution";

export function Task3Screen() {
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<ThemeLabSource>("reference");

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: insets.bottom },
      ]}
    >
      <ThemeLabSourceTabs value={source} onChange={setSource} />

      <View style={styles.panelSlot}>
        {source === "reference" ? <ReferenceThemePanel /> : <SolutionThemePanel />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    gap: 16,
  },
  panelSlot: {
    flex: 1,
    minHeight: 0,
  },
});
