import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import { INITIAL_LIVES } from "../sensors.constants";
import type { RaceStats } from "../sensors.types";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

function AnimatedHeart({ active }: { active: boolean }) {
  const progress = useSharedValue(active ? 1 : 0);
  const scale = useSharedValue(active ? 1 : 0.85);

  useEffect(() => {
    progress.set(withTiming(active ? 1 : 0, { duration: 280 }));
    if (active) {
      scale.set(withSequence(withTiming(1.18, { duration: 120 }), withSpring(1)));
    } else {
      scale.set(
        withSequence(withTiming(1.25, { duration: 110 }), withTiming(0.85, { duration: 170 })),
      );
    }
  }, [active, progress, scale]);

  const animatedProps = useAnimatedProps(() => ({
    fill: interpolateColor(progress.get(), [0, 1], ["#D4D4D8", theme.colors.accent]),
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <AnimatedPath d={HEART_PATH} animatedProps={animatedProps} fill={theme.colors.accent} />
      </Svg>
    </Animated.View>
  );
}

type ScoreVisualizerProps = {
  stats: RaceStats;
};

export function ScoreVisualizer({ stats }: ScoreVisualizerProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.scoreValue} numberOfLines={1} adjustsFontSizeToFit>
        {stats.score}
      </Text>

      <View style={styles.heartsRow}>
        {Array.from({ length: INITIAL_LIVES }).map((_, index) => (
          <AnimatedHeart key={`heart-${index}`} active={index < stats.lives} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    fontFamily: monoFont,
    fontVariant: ["tabular-nums"],
  },
  heartsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
