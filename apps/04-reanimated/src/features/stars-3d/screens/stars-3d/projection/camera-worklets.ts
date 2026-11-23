import { maxOrbitRadius } from "../solar-system";
import {
  BASE_CAMERA_DISTANCE,
  MAX_CAMERA_DISTANCE,
  MAX_CAMERA_PITCH,
  MIN_CAMERA_DISTANCE,
  MIN_CAMERA_PITCH,
} from "./camera-constants";
import { EDGE_INSET } from "./lens-constants";
import type { SceneViewport } from "./types";

type FocusDistanceForBodyParams = {
  bodySize: number;
  viewport: SceneViewport;
};

export function clampCameraDistance(distance: number): number {
  "worklet";

  return Math.min(MAX_CAMERA_DISTANCE, Math.max(MIN_CAMERA_DISTANCE, distance));
}

export function clampCameraPitch(pitch: number): number {
  "worklet";

  return Math.min(MAX_CAMERA_PITCH, Math.max(MIN_CAMERA_PITCH, pitch));
}

/** Target camera distance so a centered body spans roughly a quarter of the viewport. */
export function focusDistanceForBody({ bodySize, viewport }: FocusDistanceForBodyParams): number {
  "worklet";

  const { width: viewWidth, height: viewHeight } = viewport;
  const halfWidth = Math.max(viewWidth / 2 - EDGE_INSET, 1);
  const halfHeight = Math.max(viewHeight / 2 - EDGE_INSET, 1);
  const half = Math.min(halfWidth, halfHeight);
  const focal = (half * BASE_CAMERA_DISTANCE) / maxOrbitRadius;
  const desiredSize = Math.min(viewWidth, viewHeight) * 0.26;

  return clampCameraDistance((bodySize * focal) / Math.max(desiredSize, 1));
}
