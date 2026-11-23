import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { SPEED_STREAK_COUNT } from "../road-track.constants";
import { styles } from "../road-track.styles";
import type { SpeedStreakProps } from "../road-track.types";

export function SpeedStreak({
  index,
  side,
  roadHeight,
  roadScrollY,
  liveSpeedKmh,
}: SpeedStreakProps) {
  const step = roadHeight / SPEED_STREAK_COUNT;

  const animatedStyle = useAnimatedStyle(() => {
    const speedRatio = Math.max(0, Math.min(1, (liveSpeedKmh.get() - 120) / 110));
    const offset = (roadScrollY.get() * roadHeight * 1.45 + index * step) % roadHeight;
    return {
      opacity: speedRatio * 0.72,
      transform: [{ translateY: offset - 40 }, { scaleY: 0.7 + speedRatio * 0.8 }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.speedStreak,
        side === "left" ? styles.speedStreakLeft : styles.speedStreakRight,
        animatedStyle,
      ]}
    />
  );
}
