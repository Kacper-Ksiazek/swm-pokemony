import {
  Profiler,
  type ProfilerOnRenderCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { formatCodePoint, ICOMOON_GLYPHS, ICOMOON_ICON_NAMES } from "../shared";
import { Icon } from "./components/icon";

type Metrics = {
  reactMs: number;
  paintMs: number | null;
};

const COUNTS = [6, 300, 600, 1200] as const;
const COLORS = ["#111111", "#0d74ce", "#e5484d", "#30a46c"] as const;

export function SolutionFontPanel() {
  const [count, setCount] = useState<(typeof COUNTS)[number]>(600);
  const [color, setColor] = useState<(typeof COLORS)[number]>("#111111");
  const [runKey, setRunKey] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({ reactMs: 0, paintMs: null });

  const startTimeRef = useRef<number>(0);
  const reactMsRef = useRef<number>(0);

  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: `${runKey}-${index}`,
        name: ICOMOON_ICON_NAMES[index % ICOMOON_ICON_NAMES.length],
      })),
    [count, runKey],
  );

  const triggerBenchmark = (nextCount: (typeof COUNTS)[number]) => {
    setMetrics({ reactMs: 0, paintMs: null });
    setCount(nextCount);
    setRunKey((prev) => prev + 1);
  };

  const handleProfilerRender: ProfilerOnRenderCallback = (
    _id,
    _phase,
    actualDuration,
    _baseDuration,
    startTime,
  ) => {
    startTimeRef.current = startTime;
    reactMsRef.current = actualDuration;
  };

  useEffect(() => {
    let cancelled = false;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!cancelled) {
          setMetrics({
            reactMs: reactMsRef.current,
            paintMs: performance.now() - startTimeRef.current,
          });
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [count, runKey]);

  const isPreview = count === 6;

  return (
    <ScrollView contentContainerStyle={styles.panel} showsVerticalScrollIndicator={false}>
      <Text style={styles.packageName}>with-icon-font · &lt;Icon name=&quot;...&quot; /&gt;</Text>
      <Text style={styles.badge}>Natywny asset z prebuildu (bez useFonts)</Text>

      <View style={styles.controlsCard}>
        <View style={styles.row}>
          {COUNTS.map((item) => (
            <Pressable
              key={item}
              onPress={() => triggerBenchmark(item)}
              style={[styles.chip, count === item && styles.chipActive]}
            >
              <Text style={[styles.chipText, count === item && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.colorRow}>
            {COLORS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setColor(item)}
                style={[
                  styles.colorDot,
                  { backgroundColor: item },
                  color === item && styles.colorDotActive,
                ]}
              />
            ))}
          </View>

          <Pressable onPress={() => triggerBenchmark(count)} style={styles.rerunButton}>
            <Text style={styles.rerunText}>Remount</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Mount + Paint</Text>
          <Text style={styles.metricValue}>
            {metrics.paintMs === null ? "…" : `${metrics.paintMs.toFixed(1)} ms`}
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>React commit</Text>
          <Text style={styles.metricValue}>{metrics.reactMs.toFixed(1)} ms</Text>
        </View>
      </View>

      <Profiler id={`task-5-solution-${count}`} onRender={handleProfilerRender}>
        <View key={runKey} style={isPreview ? styles.previewGrid : styles.denseGrid}>
          {items.map((item) =>
            isPreview ? (
              <View key={item.id} style={styles.card}>
                <Icon name={item.name} size={36} color={color} />
                <Text style={styles.iconName}>{item.name}</Text>
                <Text style={styles.codePoint}>{formatCodePoint(ICOMOON_GLYPHS[item.name])}</Text>
              </View>
            ) : (
              <Icon key={item.id} name={item.name} size={20} color={color} />
            ),
          )}
        </View>
      </Profiler>

      <Text style={styles.hint}>
        Font skopiowany przez plugin ./plugins/with-icon-font.ts podczas expo prebuild. Wymaga
        przebudowania natywnej aplikacji po dodaniu pluginu.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 24,
    gap: 12,
  },
  packageName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666666",
    fontFamily: "Menlo",
  },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1b7f4b",
    backgroundColor: "#e6f6ed",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  controlsCard: {
    width: "100%",
    padding: 12,
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e8eb",
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8dce2",
  },
  chipActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444444",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotActive: {
    borderColor: "#111111",
    transform: [{ scale: 1.12 }],
  },
  rerunButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#e8f4fc",
  },
  rerunText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0d74ce",
  },
  metricsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  metricBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e8eb",
    gap: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#666666",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    fontFamily: "Menlo",
  },
  previewGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  denseGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    padding: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e8eb",
  },
  card: {
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e8eb",
    gap: 6,
  },
  iconName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
  },
  codePoint: {
    fontSize: 11,
    color: "#888888",
    fontFamily: "Menlo",
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 8,
  },
});
