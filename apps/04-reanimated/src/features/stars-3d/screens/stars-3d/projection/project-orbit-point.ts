import { maxOrbitRadius } from "../solar-system";
import { BASE_CAMERA_DISTANCE } from "./camera-constants";
import { EDGE_INSET, MIN_DEPTH } from "./lens-constants";
import type { ProjectedBody, SceneViewport } from "./types";

type PlanePoint = {
  x: number;
  z: number;
};

type CameraState = {
  distance: number;
  yaw: number;
  pitch: number;
};

type ProjectOrbitPointParams = {
  /** Offset from the camera center in world XZ. */
  orbit: PlanePoint;
  camera: CameraState;
  viewport: SceneViewport;
};

/**
 * Camera looks at the sun. Yaw spins the orbit plane around the vertical axis.
 * Pitch is radians above the ecliptic: smaller is more edge-on, π/2 is top-down.
 *
 * x' = x cos yaw − z sin yaw
 * z' = x sin yaw + z cos yaw
 * depth = distance + z' · cos(pitch)
 * screenX = focal · x' / depth
 * screenY = −focal · z' · sin(pitch) / depth  (RN y grows downward, so the far side is up)
 * scale = focal / depth   (body pixels share the orbit's world scale)
 */
export function projectOrbitPoint(params: ProjectOrbitPointParams): ProjectedBody {
  "worklet";

  const {
    orbit: { x: orbitX, z: orbitZ },
    camera: { distance: cameraDistance, yaw, pitch },
    viewport: { width: viewWidth, height: viewHeight },
  } = params;

  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);

  const x = orbitX * cosYaw - orbitZ * sinYaw;
  const z = orbitX * sinYaw + orbitZ * cosYaw;

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const depth = cameraDistance + z * cosPitch;

  if (depth <= MIN_DEPTH) {
    return { x: 0, y: 0, scale: 1, depth: 0 };
  }

  const halfWidth = Math.max(viewWidth / 2 - EDGE_INSET, 1);
  const halfHeight = Math.max(viewHeight / 2 - EDGE_INSET, 1);
  const half = Math.min(halfWidth, halfHeight);
  const focal = (half * BASE_CAMERA_DISTANCE) / maxOrbitRadius;

  return {
    x: (focal * x) / depth,
    y: (-focal * z * sinPitch) / depth,
    scale: focal / depth,
    depth,
  };
}
