import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "./theme";

/** Full-width blue action button (e.g. "Compute in C++"). */
export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

/** Neutral dark button, used for the "minus" side of a pair. */
export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.accentStrong,
    borderWidth: 1,
    borderColor: theme.colors.accentStrongBorder,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondary: {
    flex: 1,
    backgroundColor: "#1B233D",
    borderWidth: 1,
    borderColor: "#2E3B61",
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryLabel: {
    color: theme.colors.textHeading,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
