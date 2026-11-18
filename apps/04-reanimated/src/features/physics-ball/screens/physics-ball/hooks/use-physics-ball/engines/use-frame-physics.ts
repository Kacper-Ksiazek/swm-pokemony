import { useEffect } from "react";
import { useFrameCallback } from "react-native-reanimated";

import { FRAME_FRICTION_PER_SEC, STOP_SPEED } from "../use-physics-ball.constants";
import type { BallStatus, PhysicsMode, PhysicsSharedState } from "../use-physics-ball.types";
import { clamp, getArenaBounds, stepAxisWithBounce } from "../utils/physics-math";

type UseFramePhysicsParams = {
  state: PhysicsSharedState;
  mode: PhysicsMode;
  status: BallStatus;
};

/** Drives per-frame ball integration and wall collisions when `mode === "frameCallback"`. */
export function useFramePhysics({ state, mode, status }: UseFramePhysicsParams) {
  const {
    x,
    y,
    vx,
    vy,

    isDragging,
    isSimulating,

    bounces,
    lastWall,

    arenaWidth,
    arenaHeight,
    activeMode,
  } = state;

  const frameCallback = useFrameCallback((frameInfo) => {
    "worklet";

    if (activeMode.get() !== "frameCallback" || isDragging.get() || !isSimulating.get()) {
      return;
    }

    const { maxX, maxY } = getArenaBounds(arenaWidth.get(), arenaHeight.get());
    if (maxX <= 0 || maxY <= 0) {
      return;
    }

    const rawDt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
    const friction = Math.pow(FRAME_FRICTION_PER_SEC, dt);

    const nextVx = vx.get() * friction;
    const nextVy = vy.get() * friction;

    const stepX = stepAxisWithBounce(x.get() + nextVx * dt, nextVx, maxX, "right", "left");
    const stepY = stepAxisWithBounce(y.get() + nextVy * dt, nextVy, maxY, "bottom", "top");

    if (stepX.hitWall !== "none") {
      bounces.set(bounces.get() + 1);
      lastWall.set(stepX.hitWall);
    }
    if (stepY.hitWall !== "none") {
      bounces.set(bounces.get() + 1);
      lastWall.set(stepY.hitWall);
    }

    x.set(clamp(stepX.pos, -maxX, maxX));
    y.set(clamp(stepY.pos, -maxY, maxY));

    if (Math.hypot(stepX.vel, stepY.vel) < STOP_SPEED) {
      vx.set(0);
      vy.set(0);
      isSimulating.set(false);
    } else {
      vx.set(stepX.vel);
      vy.set(stepY.vel);
    }
  }, false);

  const startFrameEngine = (active: boolean) => {
    frameCallback.setActive(active);
  };

  useEffect(() => {
    if (status === "idle" && mode === "frameCallback") {
      frameCallback.setActive(false);
    }
  }, [frameCallback, mode, status]);

  return { startFrameEngine };
}
