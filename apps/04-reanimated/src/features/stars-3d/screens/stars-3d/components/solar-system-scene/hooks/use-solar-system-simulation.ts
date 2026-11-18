import { useCallback, useEffect } from "react";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";

import type { ProjectedBody } from "../../../projection";
import type { WorldPoint } from "../../orbit-path";
import {
  INITIAL_ANGLES,
  INITIAL_PROJECTIONS,
  INITIAL_WORLD_POSITIONS,
} from "../solar-system-scene.constants";
import type { FocusRequest } from "../solar-system-scene.types";
import { computeSimulationFrame } from "../utils/compute-simulation-frame";
import { useBodyFocus } from "./use-body-focus";
import { useSceneCamera } from "./use-scene-camera";

type UseSolarSystemSimulationParams = {
  focusRequest: FocusRequest | null;
  drawerHeight: number;
  isActive?: boolean;
};

export function useSolarSystemSimulation({
  focusRequest,
  drawerHeight,
  isActive = true,
}: UseSolarSystemSimulationParams) {
  const {
    cameraDistance,
    yaw,
    pitch,
    viewport,
    screenOffsetY,
    setViewport,
    resetOrientation,
    resetZoom,
  } = useSceneCamera(drawerHeight);

  const orbitAngles = useSharedValue<number[]>(INITIAL_ANGLES);
  const spinAngles = useSharedValue<number[]>(INITIAL_ANGLES);
  const worldPositions = useSharedValue<WorldPoint[]>(INITIAL_WORLD_POSITIONS);
  const projections = useSharedValue<ProjectedBody[]>(INITIAL_PROJECTIONS);

  const cameraCenter = useSharedValue<WorldPoint>({ x: 0, z: 0 });

  const { focusedIndex, focusOffsetX, focusOffsetZ, focusBodyOnUI } = useBodyFocus({
    focusRequest,
    viewport,
    worldPositions,
    cameraDistance,
  });

  const frameCallback = useFrameCallback(
    useCallback(
      (frameInfo) => {
        "worklet";

        const { width, height } = viewport.get();
        const rawDt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;

        const frame = computeSimulationFrame({
          dt: Math.min(rawDt, 0.05),
          prevOrbits: orbitAngles.get(),
          prevSpins: spinAngles.get(),
          focusedIndex: focusedIndex.get(),
          focusOffsetX: focusOffsetX.get(),
          focusOffsetZ: focusOffsetZ.get(),
          cameraDistance: cameraDistance.get(),
          yaw: yaw.get(),
          pitch: pitch.get(),
          screenOffsetY: screenOffsetY.get(),
          viewportWidth: width,
          viewportHeight: height,
        });

        orbitAngles.set(frame.nextOrbits);
        spinAngles.set(frame.nextSpins);
        worldPositions.set(frame.nextWorldPositions);

        const prevCenter = cameraCenter.get();
        if (prevCenter.x !== frame.center.x || prevCenter.z !== frame.center.z) {
          cameraCenter.set(frame.center);
        }

        if (frame.nextProjections !== null) {
          projections.set(frame.nextProjections);
        }
      },
      [
        cameraCenter,
        cameraDistance,
        focusOffsetX,
        focusOffsetZ,
        focusedIndex,
        orbitAngles,
        pitch,
        projections,
        screenOffsetY,
        spinAngles,
        viewport,
        worldPositions,
        yaw,
      ],
    ),
    false,
  );

  useEffect(() => {
    frameCallback.setActive(isActive);
  }, [frameCallback, isActive]);

  return {
    cameraDistance,
    yaw,
    pitch,
    viewport,
    spinAngles,
    worldPositions,
    projections,
    cameraCenter,
    screenOffsetY,
    focusBodyOnUI,
    setViewport,
    resetOrientation,
    resetZoom,
  };
}
