import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/components/theme";
import { PLANETS, SUN } from "../solar-system-bodies";

const LEGEND_ITEMS = [
  { id: SUN.id, color: SUN.color, label: SUN.label },
  ...PLANETS.map(({ id, color, label }) => ({ id, color, label })),
];

export function SolarSystemLegend() {
  return (
    <View style={styles.legend}>
      {LEGEND_ITEMS.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={[styles.swatch, { backgroundColor: item.color }]} />
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});
