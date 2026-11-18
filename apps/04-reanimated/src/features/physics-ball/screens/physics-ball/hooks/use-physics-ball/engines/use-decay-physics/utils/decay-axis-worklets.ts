import type { SharedValue } from "react-native-reanimated";
import { cancelAnimation, withDecay } from "react-native-reanimated";

import { DECELERATION, MIN_BOUNCE_SPEED, RESTITUTION } from "../../../use-physics-ball.constants";
import type { WallHit } from "../../../use-physics-ball.types";
import type { BounceOutcome, DecayAxisParams } from "../use-decay-physics.types";

export function computeDecayVelocity(startVelocity: number, elapsedMs: number): number {
  "worklet";

  return startVelocity * Math.pow(DECELERATION, Math.max(0, elapsedMs));
}

/** Returns bounce target and reflected velocity when crossing either wall while moving into it. */
export function resolveDecayBounce(
  position: number,
  velocity: number,
  maxBound: number,
  positiveWall: Exclude<WallHit, "none">,
  negativeWall: Exclude<WallHit, "none">,
): BounceOutcome | null {
  "worklet";

  if (position >= maxBound && velocity > 0) {
    const nextVelocity = -Math.abs(velocity) * RESTITUTION;

    return {
      wall: positiveWall,
      bound: maxBound,
      nextVelocity,
      shouldStop: Math.abs(nextVelocity) < MIN_BOUNCE_SPEED,
    };
  }

  if (position <= -maxBound && velocity < 0) {
    const nextVelocity = Math.abs(velocity) * RESTITUTION;

    return {
      wall: negativeWall,
      bound: -maxBound,
      nextVelocity,
      shouldStop: Math.abs(nextVelocity) < MIN_BOUNCE_SPEED,
    };
  }

  return null;
}

export function startAxisDecay(
  position: SharedValue<number>,
  velocity: SharedValue<number>,
  startVelocity: SharedValue<number>,
  startTime: SharedValue<number>,
  launchVelocity: number,
  now: number,
) {
  "worklet";

  startVelocity.set(launchVelocity);
  startTime.set(now);
  position.set(
    withDecay({ velocity: launchVelocity, deceleration: DECELERATION }, (finished) => {
      "worklet";

      if (finished) {
        velocity.set(0);
        startVelocity.set(0);
      }
    }),
  );
}

export function stepAxisDecay(currPos: number, axis: DecayAxisParams) {
  "worklet";

  const now = performance.now();

  // Analytical velocity avoids delta/dt spikes when `x.set(maxX)` resets overshoot on bounce.
  const currentVelocity = computeDecayVelocity(
    axis.startVelocity.get(),
    now - axis.startTime.get(),
  );
  axis.velocity.set(Math.abs(currentVelocity) < 1 ? 0 : currentVelocity);

  const bounce = resolveDecayBounce(
    currPos,
    currentVelocity,
    axis.maxBound,
    axis.positiveWall,
    axis.negativeWall,
  );
  if (!bounce) {
    return;
  }

  axis.bounces.set(axis.bounces.get() + 1);
  axis.lastWall.set(bounce.wall);

  if (bounce.shouldStop) {
    cancelAnimation(axis.position);
    axis.position.set(bounce.bound);
    axis.velocity.set(0);
    axis.startVelocity.set(0);
    return;
  }

  axis.position.set(bounce.bound);
  axis.velocity.set(bounce.nextVelocity);

  startAxisDecay(
    axis.position,
    axis.velocity,
    axis.startVelocity,
    axis.startTime,
    bounce.nextVelocity,
    now,
  );
}
