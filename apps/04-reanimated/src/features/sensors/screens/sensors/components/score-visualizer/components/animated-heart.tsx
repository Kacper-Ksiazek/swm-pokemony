import { useEffect } from "react";
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

import { VICE_COLORS } from "../../../constants";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

type AnimatedHeartProps = {
  active: boolean;
};

export function AnimatedHeart({ active }: AnimatedHeartProps) {
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
    fill: interpolateColor(progress.get(), [0, 1], [VICE_COLORS.heartEmpty, VICE_COLORS.pink]),
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <AnimatedPath d={HEART_PATH} animatedProps={animatedProps} fill={VICE_COLORS.pink} />
      </Svg>
    </Animated.View>
  );
}
