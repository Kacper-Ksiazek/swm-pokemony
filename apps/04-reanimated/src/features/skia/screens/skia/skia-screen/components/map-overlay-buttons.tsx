import { Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";

import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

const OVERLAY_FG = "#FFFFFF";

const overlayChrome = {
  backgroundColor: "rgba(17, 17, 20, 0.88)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.22)",
  shadowColor: "#000",
  shadowOpacity: 0.28,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
};

const overlayButton = {
  position: "absolute" as const,
  top: 10,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 6,
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: theme.radius.lg,
  ...overlayChrome,
};

type MapOverlayButtonsProps = {
  landscape: boolean;
  onToggleOrientation: () => void;
};

export function MapOverlayButtons({ landscape, onToggleOrientation }: MapOverlayButtonsProps) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Landing"
        style={({ pressed }) => [styles.landing, pressed && styles.overlayPressed]}
        onPress={() => router.push("/")}
      >
        <IconSymbol name="house.fill" size={18} color={OVERLAY_FG} />
        <Text style={styles.overlayText}>Landing</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={landscape ? "Portrait" : "Landscape"}
        style={({ pressed }) => [styles.rotate, pressed && styles.overlayPressed]}
        onPress={onToggleOrientation}
      >
        <IconSymbol
          name={landscape ? "iphone.portrait" : "iphone.landscape"}
          size={18}
          color={OVERLAY_FG}
        />
        <Text style={styles.overlayText}>{landscape ? "Portrait" : "Landscape"}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  landing: { ...overlayButton, left: 12 },
  rotate: { ...overlayButton, right: 12 },
  overlayPressed: { opacity: 0.88 },
  overlayText: {
    fontSize: 15,
    fontWeight: "700",
    color: OVERLAY_FG,
    letterSpacing: 0.2,
  },
});
