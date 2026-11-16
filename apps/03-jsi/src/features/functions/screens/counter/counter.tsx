import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { DemoCard } from "@/components/demo-card";
import { DemoScreen } from "@/components/demo-screen";
import { PrimaryButton, SecondaryButton } from "@/components/primary-button";
import { theme } from "@/components/theme";

/** #5 increment / decrement HostFunctions over a native counter. */
export function CounterScreen() {
  const [counter, setCounter] = useState(() => globalThis.counter);

  const handleSync = useCallback(() => setCounter(globalThis.counter), []);

  const handleIncrement = useCallback(() => {
    globalThis.increment();
    setCounter(globalThis.counter);
  }, []);

  const handleDecrement = useCallback(() => {
    globalThis.decrement();
    setCounter(globalThis.counter);
  }, []);

  return (
    <DemoScreen
      badge="C++ ↔ JS Bridge"
      title="Counter"
      action={{ label: "Sync", onPress: handleSync }}
    >
      <DemoCard eyebrow="NATIVE STATE" title="Kacper counter (C++)">
        <View style={styles.display}>
          <Text style={styles.value}>{counter}</Text>
        </View>
        <View style={styles.row}>
          <SecondaryButton label="− Decrement" onPress={handleDecrement} />
          <PrimaryButton label="+ Increment" onPress={handleIncrement} />
        </View>
      </DemoCard>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  display: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: theme.radius.lg + 2,
    paddingVertical: 28,
    alignItems: "center",
  },
  value: {
    fontSize: 56,
    fontWeight: "700",
    color: theme.colors.accent,
    fontVariant: ["tabular-nums"],
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
});
