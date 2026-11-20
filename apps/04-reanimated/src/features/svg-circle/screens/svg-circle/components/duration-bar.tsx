import { StyleSheet, Text, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

export interface TimelineSegment {
  label: string;
  durationMs: number;
  color: string;
}

interface DurationBarProps {
  cycle: SharedValue<number>;
  segments: TimelineSegment[];
  totalMs: number;
}

export function DurationBar({ cycle, segments, totalMs }: DurationBarProps) {
  const trackWidth = useSharedValue(0);

  const playheadStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cycle.get() * trackWidth.get() }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <Text style={styles.total}>{totalMs} ms cycle</Text>
      </View>

      <View
        style={styles.track}
        onLayout={(event) => {
          trackWidth.set(event.nativeEvent.layout.width);
        }}
      >
        {segments.map((segment, index) => (
          <View
            key={`${segment.label}-${index}`}
            style={[
              styles.segment,
              {
                flex: segment.durationMs,
                backgroundColor: segment.color,
              },
            ]}
          />
        ))}
        <Animated.View pointerEvents="none" style={[styles.playhead, playheadStyle]} />
      </View>

      <View style={styles.labelsRow}>
        {segments.map((segment, index) => (
          <View
            key={`${segment.label}-label-${index}`}
            style={[styles.labelCell, { flex: segment.durationMs }]}
          >
            <Text numberOfLines={1} style={styles.segmentLabel}>
              {segment.label}
            </Text>
            <Text numberOfLines={1} style={styles.segmentDuration}>
              {segment.durationMs}ms
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  total: {
    fontFamily: monoFont,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  track: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    flexDirection: "row",
    gap: 2,
    backgroundColor: theme.colors.surfaceBorder,
    position: "relative",
  },
  segment: {
    height: "100%",
  },
  playhead: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -1.5,
    width: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textPrimary,
  },
  labelsRow: {
    flexDirection: "row",
    gap: 2,
  },
  labelCell: {
    alignItems: "center",
    gap: 2,
  },
  segmentLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  segmentDuration: {
    fontFamily: monoFont,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
});
