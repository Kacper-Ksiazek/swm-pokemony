import { useEffect } from "react";
import {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { GameOutcome } from "../../../../utils/chess-engine";

const WASH_IN_MS = 900;

/** Fades a full-board color wash in when checkmate is delivered. */
export function useCheckmateBoardWash(checkmateWinner: Exclude<GameOutcome, "draw"> | null) {
  const wash = useSharedValue(0);

  useEffect(() => {
    if (checkmateWinner) {
      wash.set(withTiming(1, { duration: WASH_IN_MS, easing: Easing.out(Easing.cubic) }));
      return;
    }

    cancelAnimation(wash);
    wash.set(withTiming(0, { duration: 280 }));
  }, [checkmateWinner, wash]);

  const washStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wash.get(), [0, 1], [0, 0.72]),
  }));

  return washStyle;
}
