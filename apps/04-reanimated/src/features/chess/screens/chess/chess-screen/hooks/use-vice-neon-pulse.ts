import { useEffect } from "react";
import {
  Easing,
  cancelAnimation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { VICE_CHESS_COLORS } from "../../constants/vice-chess.constants";

const NEON_CYCLE = [
  VICE_CHESS_COLORS.cyan,
  VICE_CHESS_COLORS.pink,
  VICE_CHESS_COLORS.purple,
  VICE_CHESS_COLORS.gold,
] as const;

/** Shared cyan→pink→purple→gold pulse for autopilot glow (board frame, Auto button). */
export function useViceNeonPulse(active: boolean) {
  const colorPhase = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active) {
      colorPhase.set(
        withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }), -1, true),
      );
      pulse.set(
        withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true),
      );
      return;
    }

    cancelAnimation(colorPhase);
    cancelAnimation(pulse);
    colorPhase.set(0);
    pulse.set(0);
  }, [active, colorPhase, pulse]);

  const neonFillStyle = useAnimatedStyle(() => {
    if (!active) {
      return {};
    }

    const neon = interpolateColor(colorPhase.get(), [0, 0.33, 0.66, 1], [...NEON_CYCLE]);
    return {
      borderColor: neon,
      backgroundColor: neon,
    };
  });

  const neonBorderStyle = useAnimatedStyle(() => {
    if (!active) {
      return {};
    }

    const neon = interpolateColor(colorPhase.get(), [0, 0.33, 0.66, 1], [...NEON_CYCLE]);
    return { borderColor: neon };
  });

  const neonGlowStyle = useAnimatedStyle(() => {
    if (!active) {
      return { shadowOpacity: 0, shadowRadius: 0 };
    }

    const neon = interpolateColor(colorPhase.get(), [0, 0.33, 0.66, 1], [...NEON_CYCLE]);
    const breathe = pulse.get();

    return {
      shadowColor: neon,
      shadowOpacity: interpolate(breathe, [0, 1], [0.45, 0.95]),
      shadowRadius: interpolate(breathe, [0, 1], [16, 40]),
    };
  });

  const neonGlowStyleCompact = useAnimatedStyle(() => {
    if (!active) {
      return { shadowOpacity: 0, shadowRadius: 0 };
    }

    const neon = interpolateColor(colorPhase.get(), [0, 0.33, 0.66, 1], [...NEON_CYCLE]);
    const breathe = pulse.get();

    return {
      shadowColor: neon,
      shadowOpacity: interpolate(breathe, [0, 1], [0.5, 1]),
      shadowRadius: interpolate(breathe, [0, 1], [8, 22]),
    };
  });

  return { neonFillStyle, neonBorderStyle, neonGlowStyle, neonGlowStyleCompact };
}
