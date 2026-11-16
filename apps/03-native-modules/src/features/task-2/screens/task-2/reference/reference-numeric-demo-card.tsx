import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatThreeDigitValue } from "../shared";

type ReferenceNumericDemoCardProps = {
  value: number;
  onSubtract: () => void;
  onAdd: () => void;
};

export function ReferenceNumericDemoCard({
  value,
  onSubtract,
  onAdd,
}: ReferenceNumericDemoCardProps) {
  const display = formatThreeDigitValue(value);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#7b61d8", "#4f8fe8", "#5ba3f5"]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.value} accessibilityRole="text" accessibilityLabel={display}>
          {display}
        </Text>
      </LinearGradient>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Subtract random amount"
          onPress={onSubtract}
          style={({ pressed }) => [styles.controlButton, pressed && styles.controlButtonPressed]}
        >
          <Text style={styles.controlSymbol}>−</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add random amount"
          onPress={onAdd}
          style={({ pressed }) => [styles.controlButton, pressed && styles.controlButtonPressed]}
        >
          <Text style={styles.controlSymbol}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    alignItems: "stretch",
    gap: 20,
  },
  gradient: {
    width: "100%",
    minHeight: 200,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  value: {
    fontSize: 88,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.92)",
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ebebef",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  controlSymbol: {
    fontSize: 28,
    fontWeight: "500",
    color: "#3a3a3c",
    lineHeight: 32,
  },
});
