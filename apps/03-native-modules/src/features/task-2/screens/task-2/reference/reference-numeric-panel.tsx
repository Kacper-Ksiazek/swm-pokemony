import { StyleSheet, Text, View } from "react-native";

import { ReferenceNumericDemoCard } from "./reference-numeric-demo-card";

type ReferenceNumericPanelProps = {
  value: number;
  onAdd: () => void;
  onSubtract: () => void;
};

export function ReferenceNumericPanel({ value, onAdd, onSubtract }: ReferenceNumericPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.packageName}>react-native Text</Text>
      <Text style={styles.badge}>Referencja — bez animacji</Text>

      <ReferenceNumericDemoCard value={value} onAdd={onAdd} onSubtract={onSubtract} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
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
});
