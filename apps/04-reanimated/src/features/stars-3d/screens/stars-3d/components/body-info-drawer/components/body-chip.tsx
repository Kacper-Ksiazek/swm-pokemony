import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/components/theme";

import type { BodyChipProps } from "../body-info-drawer.types";

export function BodyChip({ item, active = false, onPress }: BodyChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <View style={[styles.chipDot, { backgroundColor: item.body.color }]} />
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{item.body.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.chipBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: theme.colors.chipSelected,
    borderColor: theme.colors.badgeBorder,
  },
  chipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  chipLabelActive: {
    color: theme.colors.accentStrong,
  },
});
