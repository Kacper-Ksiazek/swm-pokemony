import { StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SPACING, TYPE_SIZE } from "@/shared/styles/colors";

type PokemonIdBadgeProps = {
  id: number;
};

export function PokemonIdBadge({ id }: PokemonIdBadgeProps) {
  const label = `#${String(id).padStart(4, "0")}`;

  return (
    <View style={styles.badge} accessibilityLabel={label}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.SURFACE,
  },
  label: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "600",
    color: COLORS.TEXT_MUTED,
  },
});
