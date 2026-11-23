import { Pressable, StyleSheet, Text } from "react-native";

import { GAME_COLORS } from "../theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

/** Big red call-to-action used on every game screen and modal. */
export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: GAME_COLORS.accent,
  },
  pressed: {
    backgroundColor: GAME_COLORS.accentPressed,
  },
  disabled: {
    backgroundColor: GAME_COLORS.disabled,
  },
  label: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
