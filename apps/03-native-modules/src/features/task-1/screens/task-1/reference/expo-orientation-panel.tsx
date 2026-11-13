import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useExpoScreenOrientation } from "./hooks/use-expo-screen-orientation";

export function ExpoOrientationPanel() {
  const { orientation, orientationLabel } = useExpoScreenOrientation();

  return (
    <View style={styles.panel}>
      <Text style={styles.packageName}>expo-screen-orientation</Text>
      <Text style={styles.badge}>Referencja z kursu</Text>

      {orientation === null ? (
        <ActivityIndicator style={styles.spinner} />
      ) : (
        <Text style={styles.orientationValue} accessibilityRole="text">
          {orientationLabel}
        </Text>
      )}

      <Text style={styles.hint}>
        Tak ma działać API, które odtworzysz w Swift (getOrientationAsync + listener).
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
    color: "#0d74ce",
    backgroundColor: "#e8f4fc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  orientationValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0d74ce",
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
