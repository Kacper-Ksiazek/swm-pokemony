import type { ProjectedBody } from "../../projection";
import { SOLAR_SYSTEM_BODIES } from "../../solar-system";
import type { WorldPoint } from "../orbit-path";

export const BODY_COUNT = SOLAR_SYSTEM_BODIES.length;
export const BODY_RADII = SOLAR_SYSTEM_BODIES.map((body) => body.radius);
export const BODY_VELOCITIES = SOLAR_SYSTEM_BODIES.map((body) => body.velocity);
export const BODY_ANGULAR_VELOCITIES = SOLAR_SYSTEM_BODIES.map((body) => body.angularVelocity);
export const BODY_SIZES = SOLAR_SYSTEM_BODIES.map((body) => body.displaySize);
export const BODY_PARENT_INDICES = SOLAR_SYSTEM_BODIES.map((body) =>
  body.parentId ? SOLAR_SYSTEM_BODIES.findIndex((candidate) => candidate.id === body.parentId) : -1,
);
export const IS_SATELLITE = BODY_PARENT_INDICES.map((parentIdx) => parentIdx > 0);

export const INITIAL_ANGLES = SOLAR_SYSTEM_BODIES.map(() => 0);
const HIDDEN_PROJECTION: ProjectedBody = { x: 0, y: 0, scale: 1, depth: 0 };
export const INITIAL_PROJECTIONS = SOLAR_SYSTEM_BODIES.map(() => HIDDEN_PROJECTION);
export const INITIAL_WORLD_POSITIONS: WorldPoint[] = SOLAR_SYSTEM_BODIES.map(() => ({
  x: 0,
  z: 0,
}));

export const MIN_HIT_RADIUS_PX = 24;
export const MIN_SATELLITE_DISTANT_HIT_RADIUS_PX = 10;
export const HIT_PADDING_PX = 10;
export const TAP_MAX_DISTANCE_PX = 12;

export const FOCUS_TRANSITION_MS = 420;
export const RESET_TRANSITION_MS = 320;
export const DRAWER_OPEN_TRANSITION_MS = 260;
export const DRAWER_CLOSE_TRANSITION_MS = 220;
