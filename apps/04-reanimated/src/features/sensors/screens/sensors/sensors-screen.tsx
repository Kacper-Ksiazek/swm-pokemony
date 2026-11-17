import { StyleSheet, Text, View } from "react-native";

import { DemoScreen } from "@/components/demo-screen";
import { theme } from "@/components/theme";

export function SensorsScreen() {
  return (
    <DemoScreen badge="07-sensors" title="Sensors">
      <View style={styles.card}>
        <Text style={styles.eyebrow}>TO DO</Text>
        <Text style={styles.body}>Accelerometer / gyroscope</Text>
      </View>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg + 2,
    padding: 16,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
});
