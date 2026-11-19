import { StyleSheet, Text } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import { VICE_COLORS } from "../../constants";

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
    const scale = withSpring(isPressed ? 0.93 : 1, { damping: 15, stiffness: 300 });

    if (variant === "brake") {
      return {
        transform: [{ scale }],
        backgroundColor: isPressed ? VICE_COLORS.pink : "rgba(255, 46, 147, 0.16)",
      };
    }

    return {
      transform: [{ scale }],
      backgroundColor: isPressed ? VICE_COLORS.cyan : "rgba(0, 240, 255, 0.16)",
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const isPressed = pressed.get();
    if (variant === "gas" && isPressed) {
      return { color: VICE_COLORS.bgDeep };
    }
    return { color: VICE_COLORS.textPrimary };
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
      <Animated.Text style={[styles.pedalLabel, labelAnimatedStyle]}>{label}</Animated.Text>
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
    borderColor: VICE_COLORS.pink,
    shadowColor: VICE_COLORS.pink,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  gasPedal: {
    borderColor: VICE_COLORS.cyan,
    shadowColor: VICE_COLORS.cyan,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  pedalLabel: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: VICE_COLORS.textPrimary,
    fontFamily: monoFont,
  },
  pedalSub: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: VICE_COLORS.gold,
    fontFamily: monoFont,
  },
});
