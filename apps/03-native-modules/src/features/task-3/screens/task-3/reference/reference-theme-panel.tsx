import { StyleSheet, Text, useColorScheme, View } from "react-native";

export function ReferenceThemePanel() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.panel}>
      <Text style={styles.packageName}>react-native · useColorScheme()</Text>
      <Text style={styles.badge}>Referencja z kursu</Text>

      <View style={[styles.swatch, isDark ? styles.swatchDark : styles.swatchLight]}>
        <Text style={[styles.value, isDark ? styles.valueOnDark : styles.valueOnLight]}>
          {colorScheme}
        </Text>
      </View>

      <Text style={styles.hint}>
        Tak ma działać Twój hook: aktualny motyw systemowy + reakcja na zmianę (Appearance API).
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
  swatch: {
    minWidth: 200,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  swatchLight: {
    backgroundColor: "#ffffff",
    borderColor: "#d0d5dd",
  },
  swatchDark: {
    backgroundColor: "#111111",
    borderColor: "#333333",
  },
  value: {
    fontSize: 36,
    fontWeight: "700",
  },
  valueOnLight: {
    color: "#0d74ce",
  },
  valueOnDark: {
    color: "#7cc4ff",
  },
  hint: {
    fontSize: 15,
    color: "#888888",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
});
