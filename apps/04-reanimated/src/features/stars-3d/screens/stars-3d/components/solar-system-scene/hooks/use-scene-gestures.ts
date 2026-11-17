import { useMemo } from "react";
import {
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from "react-native-gesture-handler";
import { type SharedValue, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  BASE_CAMERA_DISTANCE,
  clampCameraDistance,
  clampCameraPitch,
  DEFAULT_CAMERA_PITCH,
  ORBIT_DRAG_RADIANS_PER_POINT,
  type ProjectedBody,
  type SceneViewport,
} from "../../../projection";
import { TAP_MAX_DISTANCE_PX } from "../solar-system-scene.constants";
import { findTappedBody } from "../utils/find-tapped-body";

type UseSceneGesturesParams = {
  cameraDistance: SharedValue<number>;
  yaw: SharedValue<number>;
  pitch: SharedValue<number>;
  viewport: SharedValue<SceneViewport>;
  projections: SharedValue<ProjectedBody[]>;
  focusBodyOnUI: (targetIndex: number) => void;
  onSelectBody: (bodyIndex: number | null) => void;
};

export function useSceneGestures({
  cameraDistance,
  yaw,
  pitch,
  viewport,
  projections,
  focusBodyOnUI,
  onSelectBody,
}: UseSceneGesturesParams) {
  const pinchStartDistance = useSharedValue(BASE_CAMERA_DISTANCE);
  const panStartYaw = useSharedValue(0);
  const panStartPitch = useSharedValue(DEFAULT_CAMERA_PITCH);

  const pinchConfig = useMemo(
    () => ({
      onActivate: () => {
        "worklet";
        pinchStartDistance.set(cameraDistance.get());
      },
      onUpdate: (event: { scale: number }) => {
        "worklet";

        if (event.scale <= 0) {
          return;
        }

        cameraDistance.set(clampCameraDistance(pinchStartDistance.get() / event.scale));
      },
    }),
    [cameraDistance, pinchStartDistance],
  );
  const pinch = usePinchGesture(pinchConfig);

  const panConfig = useMemo(
    () => ({
      maxPointers: 1,
      onActivate: () => {
        "worklet";
        panStartYaw.set(yaw.get());
        panStartPitch.set(pitch.get());
      },
      onUpdate: (event: { translationX: number; translationY: number }) => {
        "worklet";
        yaw.set(panStartYaw.get() + event.translationX * ORBIT_DRAG_RADIANS_PER_POINT);
        pitch.set(
          clampCameraPitch(panStartPitch.get() - event.translationY * ORBIT_DRAG_RADIANS_PER_POINT),
        );
      },
    }),
    [panStartPitch, panStartYaw, pitch, yaw],
  );
  const pan = usePanGesture(panConfig);

  const tapConfig = useMemo(
    () => ({
      maxDistance: TAP_MAX_DISTANCE_PX,
      onActivate: (event: { x: number; y: number }) => {
        "worklet";
        const { width, height } = viewport.get();

        if (width <= 0 || height <= 0) {
          return;
        }

        const hitIndex = findTappedBody(
          event.x - width / 2,
          event.y - height / 2,
          projections.get(),
        );

        if (hitIndex === -1) {
          scheduleOnRN(onSelectBody, null);
          return;
        }

        focusBodyOnUI(hitIndex);
        scheduleOnRN(onSelectBody, hitIndex);
      },
    }),
    [focusBodyOnUI, onSelectBody, projections, viewport],
  );
  const tap = useTapGesture(tapConfig);

  return useSimultaneousGestures(pinch, pan, tap);
}
