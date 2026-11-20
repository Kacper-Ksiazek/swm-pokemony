import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/components/theme";

type ToolbarNavIconProps = {
  type: "prev" | "next";
  disabled?: boolean;
};

export function ToolbarNavIcon({ type, disabled }: ToolbarNavIconProps) {
  const arrow = type === "prev" ? "↑" : "↓";
  const label = type === "prev" ? "Prev" : "Next";

  return (
    <View style={[styles.navPill, disabled && styles.navPillDisabled]}>
      <Text style={[styles.navPillText, disabled && styles.navPillTextDisabled]}>
        {arrow} {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navPill: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  navPillDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  navPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  navPillTextDisabled: {
    color: "#9CA3AF",
  },
});
