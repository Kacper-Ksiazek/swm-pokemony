import { useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { DELAY_MS, MORPH_MS, TOTAL_CYCLE_MS } from "../line-to-circle.constants";
import { lineToCirclePath } from "../utils/line-to-circle-path";

function easeInOutCubic(t: number) {
  "worklet";

  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Drives the repeating line↔circle morph cycle and animated SVG path `d`. */
export function useLineToCircleAnimation(isActive = true) {
  const cycle = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      cancelAnimation(cycle);
      return;
    }

    cycle.set(0);
    cycle.set(
      withRepeat(withTiming(1, { duration: TOTAL_CYCLE_MS, easing: Easing.linear }), -1, false),
    );

    return () => {
      cancelAnimation(cycle);
    };
  }, [cycle, isActive]);

  const progress = useDerivedValue(() => {
    const elapsed = cycle.get() * TOTAL_CYCLE_MS;

    if (elapsed <= DELAY_MS) {
      return 0;
    }

    if (elapsed <= DELAY_MS + MORPH_MS) {
      return easeInOutCubic((elapsed - DELAY_MS) / MORPH_MS);
    }

    if (elapsed <= DELAY_MS + MORPH_MS + DELAY_MS) {
      return 1;
    }

    return 1 - easeInOutCubic((elapsed - DELAY_MS - MORPH_MS - DELAY_MS) / MORPH_MS);
  });

  const animatedProps = useAnimatedProps(() => ({
    d: lineToCirclePath(progress.get()),
  }));

  return { cycle, animatedProps };
}
