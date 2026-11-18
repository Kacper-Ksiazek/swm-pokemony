import type { SharedValue } from "react-native-reanimated";

export type PhysicsMode = "decay" | "frameCallback";
export type WallHit = "none" | "left" | "right" | "top" | "bottom";

export type BallStatus = "idle" | "grabbed" | "coasting";

export type BallTelemetry = {
  x: number;
  y: number;
  vx: number;
  vy: number;

  speed: number;

  bounces: number;
  lastWall: WallHit;
  status: BallStatus;

  boundsX: number;
  boundsY: number;
};

export type PhysicsSharedState = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  vx: SharedValue<number>;
  vy: SharedValue<number>;

  isDragging: SharedValue<boolean>;
  isSimulating: SharedValue<boolean>;

  bounces: SharedValue<number>;
  lastWall: SharedValue<WallHit>;

  arenaWidth: SharedValue<number>;
  arenaHeight: SharedValue<number>;
  activeMode: SharedValue<PhysicsMode>;
};
