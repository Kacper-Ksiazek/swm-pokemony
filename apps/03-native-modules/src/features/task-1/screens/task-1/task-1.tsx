import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExpoOrientationPanel } from "./reference";
import { NativeOrientationPanel } from "./solution";
import { type OrientationLabSource, OrientationSourceTabs } from "./shared";

export function Task1Screen() {
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<OrientationLabSource>("reference");

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: insets.bottom },
      ]}
    >
      <OrientationSourceTabs value={source} onChange={setSource} />

      <View style={styles.panelSlot}>
        {source === "reference" ? <ExpoOrientationPanel /> : <NativeOrientationPanel />}
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
