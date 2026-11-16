import { StyleSheet, Text, View } from "react-native";

import { monoFont } from "./demo-screen";
import { theme } from "./theme";

export function ErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

/** Label + value panel. `mono` renders the value in a monospace code style. */
export function ResultBox({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <View style={styles.resultBox}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={mono ? styles.resultMono : styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    borderRadius: theme.radius.md,
    padding: 12,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  resultBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 6,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.success,
    fontVariant: ["tabular-nums"],
  },
  resultMono: {
    fontFamily: monoFont,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.success,
  },
});
