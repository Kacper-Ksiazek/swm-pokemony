import type { BallTelemetry } from "./use-physics-ball.types";

export const BALL_SIZE = 64;
export const BALL_RADIUS = BALL_SIZE / 2;
export const GRAB_RADIUS = BALL_RADIUS + 48;

export const DECELERATION = 0.9985;
export const FRAME_FRICTION_PER_SEC = Math.pow(DECELERATION, 1000);
export const MAX_THROW_SPEED = 3200;

export const RESTITUTION = 0.82;
export const MIN_BOUNCE_SPEED = 45;
export const STOP_SPEED = 12;

export const TELEMETRY_INTERVAL_MS = 50;

export const INITIAL_TELEMETRY: BallTelemetry = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,

  speed: 0,

  bounces: 0,
  lastWall: "none",
  status: "idle",

  boundsX: 0,
  boundsY: 0,
};
