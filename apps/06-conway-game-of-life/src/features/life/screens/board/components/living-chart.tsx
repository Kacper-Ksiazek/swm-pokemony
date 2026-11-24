import { StyleSheet, Text, View } from "react-native";

const CHART_POINTS = 96;

/** Keeps the whole run on the chart. Past the cap, every other sample is dropped. */
export function appendLivingSample(samples: readonly number[], value: number): number[] {
  const next = samples.concat(value);

  if (next.length <= CHART_POINTS) {
    return next;
  }

  const compacted: number[] = [];

  for (let index = 0; index < next.length; index += 2) {
    const sample = next[index];

    if (sample !== undefined) {
      compacted.push(sample);
    }
  }

  return compacted;
}

type LivingChartProps = {
  samples: readonly number[];
};

export function LivingChart({ samples }: LivingChartProps) {
  const peak = samples.reduce((highest, value) => Math.max(highest, value), 1);

  return (
    <View style={styles.chart}>
      <Text style={styles.label}>Żywe / epoka</Text>
      <View style={styles.plot}>
        {samples.map((value, index) => (
          <View key={index} style={[styles.bar, { height: `${(value / peak) * 100}%` }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#8B8B93",
  },
  plot: {
    height: 72,
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#101114",
  },
  bar: {
    flex: 1,
    minWidth: 1,
    borderRadius: 1,
    backgroundColor: "#9EED73",
  },
});
