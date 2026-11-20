import { useAnimatedReaction, useSharedValue } from "react-native-reanimated";

import type { PhysicsSharedState } from "../../use-physics-ball.types";
import { getArenaBounds } from "../../utils/physics-math";
import { startAxisDecay, stepAxisDecay } from "./utils/decay-axis-worklets";

/** Drives `withDecay` motion and analytical wall-bounce reactions when `mode === "decay"`. */
export function useDecayPhysics(state: PhysicsSharedState) {
  const {
    x,
    y,
    vx,
    vy,

    isDragging,
    bounces,
    lastWall,

    arenaWidth,
    arenaHeight,
    activeMode,
  } = state;

  const decayStartVx = useSharedValue(0);
  const decayStartVy = useSharedValue(0);

  const decayStartTimeX = useSharedValue(0);
  const decayStartTimeY = useSharedValue(0);

  const startDecay = (launchVx: number, launchVy: number) => {
    "worklet";

    const now = performance.now();
    startAxisDecay(x, vx, decayStartVx, decayStartTimeX, launchVx, now);
    startAxisDecay(y, vy, decayStartVy, decayStartTimeY, launchVy, now);
  };

  useAnimatedReaction(
    () => x.get(),
    (currX, prevX) => {
      if (activeMode.get() !== "decay" || isDragging.get() || prevX === null) {
        return;
      }

      const { maxX } = getArenaBounds(arenaWidth.get(), arenaHeight.get());
      if (maxX <= 0) {
        return;
      }

      stepAxisDecay(currX, {
        position: x,
        velocity: vx,
        startVelocity: decayStartVx,
        startTime: decayStartTimeX,
        bounces,
        lastWall,
        maxBound: maxX,
        positiveWall: "right",
        negativeWall: "left",
      });
    },
  );

  useAnimatedReaction(
    () => y.get(),
    (currY, prevY) => {
      if (activeMode.get() !== "decay" || isDragging.get() || prevY === null) {
        return;
      }

      const { maxY } = getArenaBounds(arenaWidth.get(), arenaHeight.get());

      if (maxY <= 0) {
        return;
      }

      stepAxisDecay(currY, {
        position: y,
        velocity: vy,
        startVelocity: decayStartVy,
        startTime: decayStartTimeY,
        bounces,
        lastWall,
        maxBound: maxY,
        positiveWall: "bottom",
        negativeWall: "top",
      });
    },
  );

  return { startDecay };
}
