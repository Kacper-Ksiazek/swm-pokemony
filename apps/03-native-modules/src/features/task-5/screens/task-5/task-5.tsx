import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReferenceFontPanel } from "./reference";
import { type FontLabSource, FontLabSourceTabs } from "./shared";
import { SolutionFontPanel } from "./solution";

export function Task5Screen() {
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<FontLabSource>("reference");

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: insets.bottom },
      ]}
    >
      <FontLabSourceTabs value={source} onChange={setSource} />

      <View style={styles.panelSlot}>
        {source === "reference" ? <ReferenceFontPanel /> : <SolutionFontPanel />}
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
