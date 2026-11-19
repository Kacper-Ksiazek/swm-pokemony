import { StyleSheet, Text } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

type PedalVariant = "brake" | "gas";

type PedalButtonProps = {
  variant: PedalVariant;
  pressed: SharedValue<boolean>;
  label: string;
  sublabel: string;
  onPressIn: () => void;
  onPressOut: () => void;
};

export function PedalButton({
  variant,
  pressed,
  label,
  sublabel,
  onPressIn,
  onPressOut,
}: PedalButtonProps) {
  const fillAnimatedStyle = useAnimatedStyle(() => {
    const isPressed = pressed.get();

    if (variant === "brake") {
      return {
        backgroundColor: isPressed ? theme.colors.accent : "rgba(185, 28, 28, 0.22)",
      };
    }

    return {
      backgroundColor: isPressed ? "#16A34A" : "rgba(21, 128, 61, 0.24)",
    };
  });

  return (
    <Animated.View
      onTouchStart={onPressIn}
      onTouchEnd={onPressOut}
      onTouchCancel={onPressOut}
      style={[
        styles.pedalButton,
        variant === "brake" ? styles.brakePedal : styles.gasPedal,
        fillAnimatedStyle,
      ]}
    >
      <Text style={styles.pedalLabel}>{label}</Text>
      <Text style={styles.pedalSub}>{sublabel}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pedalButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  brakePedal: {
    borderColor: theme.colors.accent,
  },
  gasPedal: {
    borderColor: "#22C55E",
  },
  pedalLabel: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#FFFFFF",
    fontFamily: monoFont,
  },
  pedalSub: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.78)",
    fontFamily: monoFont,
  },
});
