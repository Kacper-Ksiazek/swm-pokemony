import { maxOrbitRadius } from "../solar-system";

export const DEFAULT_CAMERA_PITCH = 0.75;
export const MIN_CAMERA_PITCH = 0.05;
export const MAX_CAMERA_PITCH = 1;

/** A horizontal drag of this many points turns the system halfway around. */
const HALF_TURN_DRAG_POINTS = 220;
export const ORBIT_DRAG_RADIANS_PER_POINT = Math.PI / HALF_TURN_DRAG_POINTS;

/** Camera distance as a multiple of the outermost orbit. */
const BASE_DISTANCE_FACTOR = 2.4;
const MIN_DISTANCE_FACTOR = 0.04;
const MAX_DISTANCE_FACTOR = 7;

export const BASE_CAMERA_DISTANCE = maxOrbitRadius * BASE_DISTANCE_FACTOR;
export const MIN_CAMERA_DISTANCE = maxOrbitRadius * MIN_DISTANCE_FACTOR;
export const MAX_CAMERA_DISTANCE = maxOrbitRadius * MAX_DISTANCE_FACTOR;
