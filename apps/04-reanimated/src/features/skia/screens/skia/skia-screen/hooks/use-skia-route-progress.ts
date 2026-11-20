import { useEffect } from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { ROUTE_ANIM_MS } from "../constants/skia-map.constants";

export function useSkiaRouteProgress(): {
  progress: SharedValue<number>;
  routeProgressFillStyle: ReturnType<typeof useAnimatedStyle>;
  onProgressTrackLayout: (e: LayoutChangeEvent) => void;
} {
  const progress = useSharedValue(0);
  const progressTrackWidth = useSharedValue(0);

  const routeProgressFillStyle = useAnimatedStyle(() => ({
    width: progressTrackWidth.get() * progress.get(),
  }));

  useEffect(() => {
    progress.set(
      withRepeat(withTiming(1, { duration: ROUTE_ANIM_MS, easing: Easing.inOut(Easing.quad) }), -1),
    );
  }, [progress]);

  function onProgressTrackLayout(e: LayoutChangeEvent) {
    progressTrackWidth.set(e.nativeEvent.layout.width);
  }

  return { progress, routeProgressFillStyle, onProgressTrackLayout };
}
