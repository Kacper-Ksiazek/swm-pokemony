import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/icon-symbol";

import { VICE_CHESS_COLORS } from "../../constants/vice-chess.constants";

import { AutopilotToolButton } from "./autopilot-tool-button";

type ChessToolRowProps = {
  autopilot: boolean;
  paddingBottom: number;
  onBack: () => void;
  onReset: () => void;
  onToggleAutopilot: () => void;
};

export function ChessToolRow({
  autopilot,
  paddingBottom,
  onBack,
  onReset,
  onToggleAutopilot,
}: ChessToolRowProps) {
  return (
    <View style={[styles.toolRow, { paddingBottom }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Wróć"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [
          styles.toolButton,
          styles.toolButtonMuted,
          pressed && styles.toolButtonPressed,
        ]}
      >
        <IconSymbol name="chevron.left" size={18} color={VICE_CHESS_COLORS.textPrimary} />
        <Text style={styles.toolLabel} numberOfLines={1}>
          Back
        </Text>
      </Pressable>

      <AutopilotToolButton autopilot={autopilot} onPress={onToggleAutopilot} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset game"
        onPress={onReset}
        style={({ pressed }) => [
          styles.toolButton,
          styles.toolButtonGold,
          pressed && styles.toolButtonPressed,
        ]}
      >
        <IconSymbol name="arrow.counterclockwise" size={18} color={VICE_CHESS_COLORS.gold} />
        <Text style={[styles.toolLabel, styles.toolLabelGold]} numberOfLines={1}>
          Reset
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toolRow: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toolButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  toolButtonGold: {
    borderColor: VICE_CHESS_COLORS.gold,
    backgroundColor: "rgba(255, 214, 0, 0.08)",
  },
  toolButtonMuted: {
    borderColor: "rgba(196, 181, 253, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  toolButtonPressed: {
    opacity: 0.85,
  },
  toolLabel: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  toolLabelGold: {
    color: VICE_CHESS_COLORS.gold,
  },
});
