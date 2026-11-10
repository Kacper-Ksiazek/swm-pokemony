import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExpoOrientationPanel } from "./components/expo-orientation-panel";
import { NativeOrientationPanel } from "./components/native-orientation-panel";
import {
  type OrientationLabSource,
  OrientationSourceTabs,
} from "./components/orientation-source-tabs";

export function Task1Screen() {
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<OrientationLabSource>("expo");

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: insets.bottom },
      ]}
    >
      <OrientationSourceTabs value={source} onChange={setSource} />

      <View style={styles.panelSlot}>
        {source === "expo" ? <ExpoOrientationPanel /> : <NativeOrientationPanel />}
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
