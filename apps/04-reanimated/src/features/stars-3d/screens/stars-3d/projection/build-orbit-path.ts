import { MIN_ORBIT_DRAW_DEPTH, ORBIT_SEGMENTS } from "./lens-constants";
import { projectOrbitPoint } from "./project-orbit-point";
import type { SceneViewport } from "./types";

type PlanePoint = {
  x: number;
  z: number;
};

type CameraState = {
  distance: number;
  yaw: number;
  pitch: number;
};

type BuildOrbitPathParams = {
  orbitRadius: number;
  origin: PlanePoint;
  center: PlanePoint;
  camera: CameraState;
  viewport: SceneViewport;
  screenOffsetY?: number;
};

export function buildOrbitPath({
  orbitRadius,
  origin,
  center,
  camera,
  viewport,
  screenOffsetY = 0,
}: BuildOrbitPathParams): string {
  "worklet";

  const { width: viewWidth, height: viewHeight } = viewport;

  if (orbitRadius <= 0 || viewWidth <= 0 || viewHeight <= 0) {
    return "";
  }

  const halfW = viewWidth / 2;
  const halfH = viewHeight / 2 + screenOffsetY;
  let path = "";
  let penDown = false;
  let allVisible = true;

  for (let i = 0; i < ORBIT_SEGMENTS; i += 1) {
    const theta = (i / ORBIT_SEGMENTS) * Math.PI * 2;
    const orbitX = origin.x + orbitRadius * Math.cos(theta) - center.x;
    const orbitZ = origin.z + orbitRadius * Math.sin(theta) - center.z;

    const point = projectOrbitPoint({
      orbit: { x: orbitX, z: orbitZ },
      camera,
      viewport,
    });

    if (point.depth < MIN_ORBIT_DRAW_DEPTH) {
      penDown = false;
      allVisible = false;

      continue;
    }

    const sx = (halfW + point.x).toFixed(1);
    const sy = (halfH + point.y).toFixed(1);

    if (!penDown) {
      path += path.length === 0 ? `M ${sx} ${sy}` : ` M ${sx} ${sy}`;
      penDown = true;
    } else {
      path += ` L ${sx} ${sy}`;
    }
  }

  if (allVisible && path.length > 0) {
    path += " Z";
  }

  return path;
}
