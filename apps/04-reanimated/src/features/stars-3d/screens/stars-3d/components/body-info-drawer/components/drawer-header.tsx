import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import type { DrawerHeaderProps } from "../body-info-drawer.types";

export function DrawerHeader({ body, bodyIndex, onRefocus, onClose }: DrawerHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={[styles.swatch, { backgroundColor: body.color }]} />
        <View style={styles.titleText}>
          <Text style={styles.title}>{body.label}</Text>
          <Text style={styles.subtitle}>{body.category}</Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Wyśrodkuj widok na obiekcie"
          hitSlop={8}
          onPress={() => onRefocus(bodyIndex)}
          style={styles.focusButton}
        >
          <IconSymbol name="scope" size={18} color={theme.colors.accentStrong} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zamknij panel informacji"
          hitSlop={8}
          onPress={onClose}
          style={styles.closeButton}
        >
          <IconSymbol name="xmark" size={18} color={theme.colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  titleText: {
    flex: 1,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.accent,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  focusButton: {
    width: 34,
    height: 34,
    backgroundColor: theme.colors.chipSelected,
    borderWidth: 1,
    borderColor: theme.colors.badgeBorder,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 34,
    height: 34,
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.chipBorder,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
