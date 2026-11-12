import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useNativeDeviceOrientation } from "./hooks/use-native-device-orientation";

export function NativeOrientationPanel() {
  const { orientation, orientationLabel } = useNativeDeviceOrientation();

  return (
    <View style={styles.panel}>
      <Text style={styles.packageName}>kksiazek-device-orientation</Text>
      <Text style={styles.badge}>Faza 1 — szkielet Swift</Text>

      {orientation === null ? (
        <ActivityIndicator style={styles.spinner} />
      ) : (
        <Text style={styles.orientationValue} accessibilityRole="text">
          {orientationLabel}
        </Text>
      )}

      <Text style={styles.hint}>
        Po pierwszym iOS rebuild moduł zwraca stałe UNKNOWN; log w konsoli Metro to smoke test.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  packageName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    fontFamily: "Menlo",
  },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d6a4f",
    backgroundColor: "#eaf4ee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  orientationValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2d6a4f",
    fontVariant: ["tabular-nums"],
  },
  spinner: {
    marginVertical: 12,
  },
  hint: {
    fontSize: 15,
    color: "#888888",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
});
