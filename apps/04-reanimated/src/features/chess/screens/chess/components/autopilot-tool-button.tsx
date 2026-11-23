import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { IconSymbol } from "@/components/icon-symbol";

import { VICE_CHESS_COLORS } from "../constants/vice-chess.constants";
import { useViceNeonPulse } from "../hooks/use-vice-neon-pulse";

type AutopilotToolButtonProps = {
  autopilot: boolean;
  onPress: () => void;
};

export function AutopilotToolButton({ autopilot, onPress }: AutopilotToolButtonProps) {
  const { neonFillStyle, neonGlowStyleCompact } = useViceNeonPulse(autopilot);

  return (
    <View style={styles.wrap}>
      {autopilot && (
        <Animated.View
          pointerEvents="none"
          style={[styles.glowShell, neonFillStyle, neonGlowStyleCompact]}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={autopilot ? "Turn off autopilot" : "Turn on autopilot"}
        onPress={onPress}
        style={styles.pressable}
      >
        {({ pressed }) =>
          autopilot ? (
            <Animated.View style={[styles.button, neonFillStyle]}>
              <IconSymbol name="scope" size={18} color={VICE_CHESS_COLORS.bgDeep} />
              <Text style={[styles.label, styles.labelOnDark]} numberOfLines={1}>
                Auto
              </Text>
            </Animated.View>
          ) : (
            <View style={[styles.button, styles.buttonCyan, pressed && styles.buttonPressed]}>
              <IconSymbol name="scope" size={18} color={VICE_CHESS_COLORS.cyan} />
              <Text style={styles.label} numberOfLines={1}>
                Manual
              </Text>
            </View>
          )
        }
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    position: "relative",
  },
  glowShell: {
    ...StyleSheet.absoluteFill,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  pressable: {
    flex: 1,
  },
  button: {
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
  buttonCyan: {
    borderColor: VICE_CHESS_COLORS.cyan,
    backgroundColor: "rgba(0, 240, 255, 0.1)",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  label: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  labelOnDark: {
    color: VICE_CHESS_COLORS.bgDeep,
  },
});
