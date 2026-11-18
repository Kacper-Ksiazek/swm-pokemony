import { useState } from "react";
import { type SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { INITIAL_TELEMETRY, TELEMETRY_INTERVAL_MS } from "../use-physics-ball.constants";
import type { BallStatus, BallTelemetry, PhysicsSharedState } from "../use-physics-ball.types";
import { getArenaBounds } from "../utils/physics-math";

/** Throttles UI-thread physics state into React telemetry snapshots without per-frame re-renders. */
export function useBallTelemetry(state: PhysicsSharedState, speed: SharedValue<number>) {
  const [telemetry, setTelemetry] = useState<BallTelemetry>(INITIAL_TELEMETRY);
  const lastTelemetryTime = useSharedValue(0);

  useAnimatedReaction(
    () => {
      const { maxX, maxY } = getArenaBounds(state.arenaWidth.get(), state.arenaHeight.get());
      return {
        x: state.x.get(),
        y: state.y.get(),
        vx: state.vx.get(),
        vy: state.vy.get(),

        speed: speed.get(),

        bounces: state.bounces.get(),
        lastWall: state.lastWall.get(),
        dragging: state.isDragging.get(),

        boundsX: maxX,
        boundsY: maxY,
      };
    },
    (curr, prev) => {
      const now = performance.now();

      const stopped = curr.vx === 0 && curr.vy === 0 && !curr.dragging;
      const stateChanged =
        prev === null ||
        curr.dragging !== prev.dragging ||
        curr.bounces !== prev.bounces ||
        curr.boundsX !== prev.boundsX ||
        curr.boundsY !== prev.boundsY ||
        (stopped && (prev.vx !== 0 || prev.vy !== 0));

      if (!stateChanged && now - lastTelemetryTime.get() < TELEMETRY_INTERVAL_MS) {
        return;
      }

      lastTelemetryTime.set(now);

      const status: BallStatus = curr.dragging ? "grabbed" : curr.speed > 1 ? "coasting" : "idle";

      scheduleOnRN(setTelemetry, {
        x: Math.round(curr.x),
        y: Math.round(curr.y),
        vx: Math.round(curr.vx),
        vy: Math.round(curr.vy),

        speed: Math.round(curr.speed),

        bounces: curr.bounces,
        lastWall: curr.lastWall,
        status,

        boundsX: Math.round(curr.boundsX),
        boundsY: Math.round(curr.boundsY),
      });
    },
  );

  return telemetry;
}
