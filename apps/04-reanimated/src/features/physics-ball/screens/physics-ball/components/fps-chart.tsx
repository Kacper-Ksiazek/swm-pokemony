import { useState } from "react";
import { type LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

type FpsChartProps = {
  samples: number[];
  currentFps: number | null;
  maxSamples: number;
};

const CHART_HEIGHT = 44;

export function FpsChart({ samples, currentFps, maxSamples }: FpsChartProps) {
  const [width, setWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const peak = samples.reduce((acc, value) => Math.max(acc, value), 60);
  const yMax = peak > 75 ? 120 : 60;
  const isHealthy = currentFps === null || currentFps >= 50;
  const strokeColor = isHealthy ? theme.colors.success : theme.colors.accent;

  let linePath = "";
  let areaPath = "";

  if (width > 0 && samples.length > 1) {
    const stepX = width / Math.max(1, maxSamples - 1);
    const offsetX = (maxSamples - samples.length) * stepX;

    const points = samples.map((fps, index) => {
      const x = offsetX + index * stepX;
      const ratio = Math.min(Math.max(fps / yMax, 0), 1);
      const y = CHART_HEIGHT - ratio * (CHART_HEIGHT - 6) - 3;
      return { x, y };
    });

    linePath = points
      .map(
        (point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
      )
      .join(" ");

    const first = points[0];
    const last = points[points.length - 1];
    areaPath = `${linePath} L${last.x.toFixed(1)},${CHART_HEIGHT} L${first.x.toFixed(1)},${CHART_HEIGHT} Z`;
  }

  const ref60Y = CHART_HEIGHT - (60 / yMax) * (CHART_HEIGHT - 6) - 3;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>UI FPS (250ms avg)</Text>
        <Text style={[styles.value, !isHealthy && styles.valueWarn]}>
          {currentFps === null ? "— fps" : `${currentFps} fps`}
        </Text>
      </View>

      <View style={styles.chartBox} onLayout={handleLayout}>
        {width > 0 && (
          <Svg width={width} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id="fpsArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={strokeColor} stopOpacity={0.22} />
                <Stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>

            <Line
              x1={0}
              y1={ref60Y}
              x2={width}
              y2={ref60Y}
              stroke={theme.colors.cardBorder}
              strokeDasharray="3 3"
              strokeWidth={1}
            />

            {areaPath !== "" && <Path d={areaPath} fill="url(#fpsArea)" />}
            {linePath !== "" && (
              <Path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: theme.colors.textMuted,
  },
  value: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.success,
    fontFamily: monoFont,
    fontVariant: ["tabular-nums"],
  },
  valueWarn: {
    color: theme.colors.accent,
  },
  chartBox: {
    height: CHART_HEIGHT,
    width: "100%",
  },
});
