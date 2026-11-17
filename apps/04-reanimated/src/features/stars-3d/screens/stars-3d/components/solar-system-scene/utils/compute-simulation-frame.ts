import { type ProjectedBody, projectOrbitPoint } from "../../../projection";
import type { WorldPoint } from "../../orbit-path";
import {
  BODY_ANGULAR_VELOCITIES,
  BODY_COUNT,
  BODY_PARENT_INDICES,
  BODY_RADII,
  BODY_VELOCITIES,
} from "../solar-system-scene.constants";

export type SimulationFrameInput = {
  dt: number;
  prevOrbits: number[];
  prevSpins: number[];
  focusedIndex: number;
  focusOffsetX: number;
  focusOffsetZ: number;
  cameraDistance: number;
  yaw: number;
  pitch: number;
  screenOffsetY: number;
  viewportWidth: number;
  viewportHeight: number;
};

export type SimulationFrameOutput = {
  nextOrbits: number[];
  nextSpins: number[];
  nextWorldPositions: WorldPoint[];
  center: WorldPoint;
  nextProjections: ProjectedBody[] | null;
};

/**
 * Updates orbit and spin angles, resolves parent-relative world coordinates
 * (parents must precede their satellites in `SOLAR_SYSTEM_BODIES`), and projects
 * each body onto the viewport around the active center.
 */
export function computeSimulationFrame(input: SimulationFrameInput): SimulationFrameOutput {
  "worklet";

  const {
    dt,
    prevOrbits,
    prevSpins,
    focusedIndex,
    focusOffsetX,
    focusOffsetZ,
    cameraDistance,
    yaw,
    pitch,
    screenOffsetY,
    viewportWidth,
    viewportHeight,
  } = input;

  const nextOrbits = new Array<number>(BODY_COUNT);
  const nextSpins = new Array<number>(BODY_COUNT);
  const nextWorldPositions = new Array<WorldPoint>(BODY_COUNT);

  for (let i = 0; i < BODY_COUNT; i += 1) {
    const radius = BODY_RADII[i];
    const angle = updateOrbitAngle(prevOrbits[i], radius, BODY_VELOCITIES[i], dt);

    nextOrbits[i] = angle;
    nextSpins[i] = updateSpinAngle(prevSpins[i], BODY_ANGULAR_VELOCITIES[i], dt);

    nextWorldPositions[i] = resolveWorldPosition(
      angle,
      radius,
      BODY_PARENT_INDICES[i],
      nextWorldPositions,
    );
  }

  const focusWorld = nextWorldPositions[focusedIndex];
  const center: WorldPoint = {
    x: focusWorld.x + focusOffsetX,
    z: focusWorld.z + focusOffsetZ,
  };

  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return {
      nextOrbits,
      nextSpins,
      nextWorldPositions,
      center,
      nextProjections: null,
    };
  }

  const nextProjections = new Array<ProjectedBody>(BODY_COUNT);

  for (let i = 0; i < BODY_COUNT; i += 1) {
    const world = nextWorldPositions[i];

    const projected = projectOrbitPoint({
      orbit: { x: world.x - center.x, z: world.z - center.z },
      camera: { distance: cameraDistance, yaw, pitch },
      viewport: { width: viewportWidth, height: viewportHeight },
    });

    nextProjections[i] =
      projected.depth > 0
        ? {
            x: projected.x,
            y: projected.y + screenOffsetY,
            scale: projected.scale,
            depth: projected.depth,
          }
        : projected;
  }

  return {
    nextOrbits,
    nextSpins,
    nextWorldPositions,
    center,
    nextProjections,
  };
}

/** Updates a body's orbital angle by `dt` (stays `0` for fixed central bodies). */
function updateOrbitAngle(prevAngle: number, radius: number, velocity: number, dt: number): number {
  "worklet";
  return radius > 0 ? prevAngle + velocity * dt : 0;
}

/** Updates a body's axial spin angle by `dt` when it has non-zero angular velocity. */
function updateSpinAngle(prevSpin: number, angularVelocity: number, dt: number): number {
  "worklet";
  return angularVelocity !== 0 ? prevSpin + angularVelocity * dt : prevSpin;
}

/** Resolves a body's world-space XZ position relative to its parent body (or the origin). */
function resolveWorldPosition(
  angle: number,
  radius: number,
  parentIndex: number,
  worldPositions: WorldPoint[],
): WorldPoint {
  "worklet";
  const parentX = parentIndex >= 0 ? worldPositions[parentIndex].x : 0;
  const parentZ = parentIndex >= 0 ? worldPositions[parentIndex].z : 0;

  return {
    x: parentX + radius * Math.cos(angle),
    z: parentZ + radius * Math.sin(angle),
  };
}
