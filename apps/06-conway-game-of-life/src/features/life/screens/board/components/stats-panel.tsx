import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { CELL_COUNT } from "../../../simulation/grid";
import { LivingChart } from "./living-chart";

type LifeEngine = "gpu" | "cpu";

type StatsPanelProps = {
  living: number;
  epoch: number;
  elapsedMs: number;
  history: readonly number[];
  engine: LifeEngine;
  onEngineChange: (engine: LifeEngine) => void;
  onReset: () => void;
};

function formatCount(value: number): string {
  return Math.trunc(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function StatsPanel({
  living,
  epoch,
  elapsedMs,
  history,
  engine,
  onEngineChange,
  onReset,
}: StatsPanelProps) {
  const dead = CELL_COUNT - living;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.panel}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stat}>
        <Text style={styles.label}>Żywe</Text>
        <Text style={styles.value}>{formatCount(living)}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Martwe</Text>
        <Text style={styles.value}>{formatCount(dead)}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Epoka</Text>
        <Text style={styles.value}>{formatCount(epoch)}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Czas</Text>
        <Text style={styles.value}>{formatElapsed(elapsedMs)}</Text>
      </View>
      <LivingChart samples={history} />
      <View style={styles.engine}>
        <Text style={[styles.engineLabel, engine === "gpu" && styles.engineLabelOn]}>GPU</Text>
        <Switch
          accessibilityLabel="Silnik CPU"
          value={engine === "cpu"}
          onValueChange={(cpu) => onEngineChange(cpu ? "cpu" : "gpu")}
          trackColor={{ false: "#3F3F46", true: "#3F3F46" }}
          thumbColor={engine === "cpu" ? "#9EED73" : "#F4F4F5"}
        />
        <Text style={[styles.engineLabel, engine === "cpu" && styles.engineLabelOn]}>CPU</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onReset}
        style={({ pressed }) => [styles.reset, pressed && styles.resetPressed]}
      >
        <Text style={styles.resetLabel}>Reset</Text>
      </Pressable>
    </ScrollView>
  );
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return clock;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    width: 200,
    backgroundColor: "#18181b",
  },
  panel: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stat: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#8B8B93",
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    color: "#F4F4F5",
  },
  engine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  engineLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#8B8B93",
  },
  engineLabelOn: {
    color: "#F4F4F5",
  },
  reset: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#27272A",
  },
  resetPressed: {
    backgroundColor: "#3F3F46",
  },
  resetLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F4F4F5",
  },
});
