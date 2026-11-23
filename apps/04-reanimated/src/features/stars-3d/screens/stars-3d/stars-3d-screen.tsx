import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { IconSymbol } from "@/components/icon-symbol";

import { BodyInfoDrawer } from "./components/body-info-drawer";
import { type FocusRequest, SolarSystemScene } from "./components/solar-system-scene";

export function Stars3dScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [drawerHeight, setDrawerHeight] = useState(0);

  function handleSelectBodyFromScene(index: number | null) {
    setSelectedIndex(index);

    if (index === null) {
      setDrawerHeight(0);
    }
  }

  function handleNavigateFromDrawer(index: number) {
    setSelectedIndex(index);
    setFocusRequest((prev) => ({
      index,
      nonce: (prev?.nonce ?? 0) + 1,
    }));
  }

  function handleCloseDrawer() {
    setSelectedIndex(null);
    setDrawerHeight(0);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <SolarSystemScene
        focusRequest={focusRequest}
        drawerHeight={drawerHeight}
        isActive={isFocused}
        onSelectBody={handleSelectBodyFromScene}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Wróć"
        hitSlop={8}
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8 }]}
      >
        <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
      </Pressable>

      <BodyInfoDrawer
        bodyIndex={selectedIndex}
        onSelectBody={handleNavigateFromDrawer}
        onRefocus={handleNavigateFromDrawer}
        onClose={handleCloseDrawer}
        onHeightChange={setDrawerHeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#232323",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100000,
  },
});
