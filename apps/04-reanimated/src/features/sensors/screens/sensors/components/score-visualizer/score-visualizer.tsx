import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { INITIAL_LIVES } from "../../constants";
import { AnimatedHeart } from "./components/animated-heart";
import { styles } from "./score-visualizer.styles";
import type { ScoreVisualizerProps } from "./score-visualizer.types";

/** HUD card: live score with pop animation, combo streak, and neon life hearts. */
export function ScoreVisualizer({ stats }: ScoreVisualizerProps) {
  const scoreScale = useSharedValue(1);
  const comboScale = useSharedValue(1);

  useEffect(() => {
    if (stats.score > 0) {
      scoreScale.set(withSequence(withTiming(1.22, { duration: 80 }), withSpring(1)));
    }
  }, [scoreScale, stats.score]);

  useEffect(() => {
    if (stats.streak >= 2) {
      comboScale.set(withSequence(withTiming(1.16, { duration: 90 }), withSpring(1)));
    }
  }, [comboScale, stats.streak]);

  const scoreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.get() }],
  }));

  const comboAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: comboScale.get() }],
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.label}>VICE SCORE</Text>

      <Animated.Text
        style={[styles.scoreValue, scoreAnimStyle]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {stats.score}
      </Animated.Text>

      {stats.streak >= 2 && (
        <Animated.View style={[styles.comboBadge, comboAnimStyle]}>
          <Text style={styles.comboText}>x{stats.streak} COMBO</Text>
        </Animated.View>
      )}

      <View style={styles.heartsRow}>
        {Array.from({ length: INITIAL_LIVES }).map((_, index) => (
          <AnimatedHeart key={`heart-${index}`} active={index < stats.lives} />
        ))}
      </View>
    </View>
  );
}
