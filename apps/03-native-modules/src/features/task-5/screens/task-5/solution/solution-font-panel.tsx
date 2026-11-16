import { StyleSheet, Text, View } from "react-native";

export function SolutionFontPanel() {
  return (
    <View style={styles.panel}>
      <Text style={styles.packageName}>Config Plugin + &lt;Icon name=&quot;...&quot; /&gt;</Text>
      <Text style={styles.badge}>Do zaimplementowania</Text>
      <Text style={styles.hint}>
        Tutaj podepniesz własny Config Plugin kopiujący font podczas prebuildu oraz komponent{" "}
        &lt;Icon /&gt; czytający glyphmapę z selection.json.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
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
    color: "#9a6700",
    backgroundColor: "#fff8c5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: "#666666",
    textAlign: "center",
  },
});
