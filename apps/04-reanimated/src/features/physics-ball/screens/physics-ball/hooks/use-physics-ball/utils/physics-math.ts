import { BALL_RADIUS, MIN_BOUNCE_SPEED, RESTITUTION } from "../use-physics-ball.constants";
import type { WallHit } from "../use-physics-ball.types";

export function clamp(value: number, min: number, max: number) {
  "worklet";

  return Math.min(Math.max(value, min), max);
}

/** Computes symmetric center-relative travel limits from arena dimensions. */
export function getArenaBounds(width: number, height: number) {
  "worklet";

  return {
    maxX: Math.max(0, width / 2 - BALL_RADIUS),
    maxY: Math.max(0, height / 2 - BALL_RADIUS),
  };
}

/** Integrates one axis step and reflects velocity when exceeding [-maxBound, maxBound]. */
export function stepAxisWithBounce(
  pos: number,
  vel: number,
  maxBound: number,
  positiveWall: Exclude<WallHit, "none">,
  negativeWall: Exclude<WallHit, "none">,
): { pos: number; vel: number; hitWall: WallHit } {
  "worklet";

  if (pos > maxBound) {
    const reflected = -Math.abs(vel) * RESTITUTION;
    if (Math.abs(reflected) < MIN_BOUNCE_SPEED) {
      return { pos: maxBound, vel: 0, hitWall: positiveWall };
    }

    return { pos: maxBound - (pos - maxBound), vel: reflected, hitWall: positiveWall };
  }

  if (pos < -maxBound) {
    const reflected = Math.abs(vel) * RESTITUTION;
    if (Math.abs(reflected) < MIN_BOUNCE_SPEED) {
      return { pos: -maxBound, vel: 0, hitWall: negativeWall };
    }

    return { pos: -maxBound + (-maxBound - pos), vel: reflected, hitWall: negativeWall };
  }

  return { pos, vel, hitWall: "none" };
}
