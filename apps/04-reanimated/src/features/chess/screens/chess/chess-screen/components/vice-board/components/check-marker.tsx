import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { VICE_CHESS_COLORS } from "../../../../constants/vice-chess.constants";

const DANGER = VICE_CHESS_COLORS.danger;

/**
 * Alarm on the king in check: a hot red frame that throbs and glows, plus a ring that keeps
 * expanding off the square like a sonar ping. Both loop until the check is gone (the parent
 * unmounts this).
 */
export function CheckMarker() {
  const throb = useSharedValue(0);
  const ripple = useSharedValue(0);

  useEffect(() => {
    throb.set(
      withRepeat(withTiming(1, { duration: 480, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
    ripple.set(withRepeat(withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }), -1));
  }, [throb, ripple]);

  const frameStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      throb.get(),
      [0, 1],
      ["rgba(255, 59, 92, 0.16)", "rgba(255, 59, 92, 0.42)"],
    ),
    shadowOpacity: interpolate(throb.get(), [0, 1], [0.6, 1]),
    shadowRadius: interpolate(throb.get(), [0, 1], [8, 22]),
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: 0.8 * (1 - ripple.get()),
    transform: [{ scale: 1 + 0.9 * ripple.get() }],
  }));

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.ripple, rippleStyle]} />
      <Animated.View
        pointerEvents="none"
        entering={FadeIn.duration(180)}
        style={[styles.frame, frameStyle]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  frame: {
    ...StyleSheet.absoluteFill,
    margin: 2,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: DANGER,
    shadowColor: DANGER,
    shadowOffset: { width: 0, height: 0 },
  },
  ripple: {
    ...StyleSheet.absoluteFill,
    margin: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: DANGER,
  },
});
