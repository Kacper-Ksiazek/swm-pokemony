import * as THREE from "three/webgpu";

import type { BoardBlueprint } from "../../../blueprint";
import { BOARD_THICKNESS, CAMERA_AZIMUTH, CAMERA_ELEVATION } from "./scene.constants";

/** Distance from the followed pawn when a turn starts. Board units. */
const FOLLOW_DISTANCE = 9;
const MIN_DISTANCE = 3;
const MIN_ELEVATION = (22 * Math.PI) / 180;
const MAX_ELEVATION = (86 * Math.PI) / 180;
/** Radians of orbit per point of finger travel. */
const ORBIT_SPEED = 0.008;
/** How quickly the camera catches up with its goal (higher = snappier). */
const SMOOTHING = 6;
/** How far the board corners may reach in normalized device coordinates in overview. */
const SCREEN_FILL = 1.02;

type Orbit = {
  target: THREE.Vector3;
  azimuth: number;
  elevation: number;
  distance: number;
};

function placeCamera(camera: THREE.PerspectiveCamera, orbit: Orbit) {
  const flat = Math.cos(orbit.elevation) * orbit.distance;

  camera.position.set(
    orbit.target.x + Math.sin(orbit.azimuth) * flat,
    orbit.target.y + Math.sin(orbit.elevation) * orbit.distance,
    orbit.target.z + Math.cos(orbit.azimuth) * flat,
  );
  camera.lookAt(orbit.target);
}

/** Smallest distance at which the whole board fits the screen from the default angle. */
function overviewDistance(camera: THREE.PerspectiveCamera, blueprint: BoardBlueprint) {
  const half = blueprint.size.width / 2;
  const corner = new THREE.Vector3();
  const orbit: Orbit = {
    target: new THREE.Vector3(),
    azimuth: CAMERA_AZIMUTH,
    elevation: CAMERA_ELEVATION,
    distance: 0,
  };
  let near = 1;
  let far = 300;

  for (let step = 0; step < 30; step += 1) {
    orbit.distance = (near + far) / 2;
    placeCamera(camera, orbit);
    camera.updateMatrixWorld();

    let reach = 0;

    for (const x of [-half, half]) {
      for (const z of [-half, half]) {
        for (const y of [0, -BOARD_THICKNESS]) {
          corner.set(x, y, z).project(camera);
          reach = Math.max(reach, Math.abs(corner.x), Math.abs(corner.y));
        }
      }
    }

    if (reach > SCREEN_FILL) {
      near = orbit.distance;
    } else {
      far = orbit.distance;
    }
  }

  return far;
}

/**
 * Orbit camera with two modes:
 * - **follow**: looks at a moving point (the current pawn) from FOLLOW_DISTANCE,
 * - **overview**: looks at the board center from far enough to see all of it.
 *
 * Gestures change the goal azimuth, elevation and distance; `update` eases the real camera
 * toward the goal every frame, so jumps between players and pinches stay smooth.
 */
export function createCameraRig(camera: THREE.PerspectiveCamera, blueprint: BoardBlueprint) {
  let maxDistance = 60;
  let followTarget: (() => THREE.Vector3 | null) | null = null;
  const current: Orbit = {
    target: new THREE.Vector3(),
    azimuth: CAMERA_AZIMUTH,
    elevation: CAMERA_ELEVATION,
    distance: 40,
  };
  const goal: Orbit = { ...current, target: current.target.clone() };

  const setAspect = (aspect: number) => {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    maxDistance = overviewDistance(camera, blueprint) * 1.15;
    placeCamera(camera, current);
  };

  /** Jumps straight to the goal, skipping the easing (used for the first frame). */
  const snap = () => {
    Object.assign(current, { ...goal, target: goal.target.clone() });
    placeCamera(camera, current);
  };

  const follow = (target: (() => THREE.Vector3 | null) | null) => {
    followTarget = target;
    goal.distance = target ? FOLLOW_DISTANCE : maxDistance / 1.15;

    if (!target) {
      goal.target.set(0, 0, 0);
    }
  };

  const orbit = (deltaX: number, deltaY: number) => {
    goal.azimuth -= deltaX * ORBIT_SPEED;
    goal.elevation = THREE.MathUtils.clamp(
      goal.elevation + deltaY * ORBIT_SPEED,
      MIN_ELEVATION,
      MAX_ELEVATION,
    );
  };

  const rotate = (radians: number) => {
    goal.azimuth -= radians;
  };

  const zoom = (scale: number) => {
    goal.distance = THREE.MathUtils.clamp(goal.distance / scale, MIN_DISTANCE, maxDistance);
  };

  const update = (deltaSeconds: number) => {
    const followed = followTarget?.();

    if (followed) {
      goal.target.copy(followed);
    }

    const blend = 1 - Math.exp(-deltaSeconds * SMOOTHING);

    current.target.lerp(goal.target, blend);
    current.azimuth += (goal.azimuth - current.azimuth) * blend;
    current.elevation += (goal.elevation - current.elevation) * blend;
    current.distance += (goal.distance - current.distance) * blend;
    placeCamera(camera, current);
  };

  return { setAspect, snap, follow, orbit, rotate, zoom, update };
}
