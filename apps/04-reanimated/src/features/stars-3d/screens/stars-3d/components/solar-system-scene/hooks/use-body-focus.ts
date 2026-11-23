import { useCallback, useEffect } from "react";
import { type SharedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnUI } from "react-native-worklets";

import { focusDistanceForBody, type SceneViewport } from "../../../projection";
import type { WorldPoint } from "../../orbit-path";
import { BODY_SIZES, FOCUS_TRANSITION_MS } from "../solar-system-scene.constants";
import type { FocusRequest } from "../solar-system-scene.types";

type UseBodyFocusParams = {
  focusRequest: FocusRequest | null;
  viewport: SharedValue<SceneViewport>;
  worldPositions: SharedValue<WorldPoint[]>;
  cameraDistance: SharedValue<number>;
};

export function useBodyFocus({
  focusRequest,
  viewport,
  worldPositions,
  cameraDistance,
}: UseBodyFocusParams) {
  const focusedIndex = useSharedValue(0);
  const focusOffsetX = useSharedValue(0);
  const focusOffsetZ = useSharedValue(0);

  const focusBodyOnUI = useCallback(
    (targetIndex: number) => {
      "worklet";

      const { width, height } = viewport.get();

      if (width <= 0 || height <= 0) {
        return;
      }

      const prevIndex = focusedIndex.get();

      if (prevIndex !== targetIndex) {
        const positions = worldPositions.get();
        const prevPos = positions[prevIndex];
        const nextPos = positions[targetIndex];

        focusOffsetX.set(focusOffsetX.get() + prevPos.x - nextPos.x);
        focusOffsetZ.set(focusOffsetZ.get() + prevPos.z - nextPos.z);
        focusedIndex.set(targetIndex);
        focusOffsetX.set(withTiming(0, { duration: FOCUS_TRANSITION_MS }));
        focusOffsetZ.set(withTiming(0, { duration: FOCUS_TRANSITION_MS }));
      }

      const targetDistance = focusDistanceForBody({
        bodySize: BODY_SIZES[targetIndex],
        viewport: { width, height },
      });
      cameraDistance.set(withTiming(targetDistance, { duration: FOCUS_TRANSITION_MS }));
    },
    [cameraDistance, focusOffsetX, focusOffsetZ, focusedIndex, viewport, worldPositions],
  );

  useEffect(() => {
    if (!focusRequest) {
      return;
    }

    scheduleOnUI(focusBodyOnUI, focusRequest.index);
  }, [focusBodyOnUI, focusRequest]);

  return {
    focusedIndex,
    focusOffsetX,
    focusOffsetZ,
    focusBodyOnUI,
  };
}
