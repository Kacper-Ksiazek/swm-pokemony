import type { SharedValue } from "react-native-reanimated";

import type { WallHit } from "../../use-physics-ball.types";

export type DecayAxisParams = {
  position: SharedValue<number>;
  velocity: SharedValue<number>;
  startVelocity: SharedValue<number>;
  startTime: SharedValue<number>;

  bounces: SharedValue<number>;
  lastWall: SharedValue<WallHit>;

  maxBound: number;
  positiveWall: Exclude<WallHit, "none">;
  negativeWall: Exclude<WallHit, "none">;
};

export type BounceOutcome = {
  wall: Exclude<WallHit, "none">;
  bound: number;
  nextVelocity: number;
  shouldStop: boolean;
};
