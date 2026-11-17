import { useEffect } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";

import {
  BASE_CAMERA_DISTANCE,
  DEFAULT_CAMERA_PITCH,
  type SceneViewport,
} from "../../../projection";
import {
  DRAWER_CLOSE_TRANSITION_MS,
  DRAWER_OPEN_TRANSITION_MS,
  RESET_TRANSITION_MS,
} from "../solar-system-scene.constants";

export function useSceneCamera(drawerHeight: number) {
  const cameraDistance = useSharedValue(BASE_CAMERA_DISTANCE);
  const yaw = useSharedValue(0);
  const pitch = useSharedValue(DEFAULT_CAMERA_PITCH);
  const viewport = useSharedValue<SceneViewport>({ width: 0, height: 0 });
  const screenOffsetY = useSharedValue(0);

  useEffect(() => {
    const targetOffset = drawerHeight > 0 ? -drawerHeight / 2 : 0;
    screenOffsetY.set(
      withTiming(targetOffset, {
        duration: drawerHeight > 0 ? DRAWER_OPEN_TRANSITION_MS : DRAWER_CLOSE_TRANSITION_MS,
      }),
    );
  }, [drawerHeight, screenOffsetY]);

  function setViewport(width: number, height: number) {
    viewport.set({ width, height });
  }

  function resetOrientation() {
    yaw.set(withTiming(0, { duration: RESET_TRANSITION_MS }));
    pitch.set(withTiming(DEFAULT_CAMERA_PITCH, { duration: RESET_TRANSITION_MS }));
  }

  function resetZoom() {
    cameraDistance.set(withTiming(BASE_CAMERA_DISTANCE, { duration: RESET_TRANSITION_MS }));
  }

  return {
    cameraDistance,
    yaw,
    pitch,
    viewport,
    screenOffsetY,
    setViewport,
    resetOrientation,
    resetZoom,
  };
}
