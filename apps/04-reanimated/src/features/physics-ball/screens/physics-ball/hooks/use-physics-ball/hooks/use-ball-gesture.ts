import { usePanGesture } from "react-native-gesture-handler";
import { cancelAnimation, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { GRAB_RADIUS, MAX_THROW_SPEED } from "../use-physics-ball.constants";
import type { PhysicsSharedState } from "../use-physics-ball.types";
import { clamp, getArenaBounds } from "../utils/physics-math";

type UseBallGestureParams = {
  state: PhysicsSharedState;
  startDecay: (launchVx: number, launchVy: number) => void;
  startFrameEngine: (active: boolean) => void;
};

/** Handles grabbing, dragging, and throwing the ball inside the arena bounds. */
export function useBallGesture({ state, startDecay, startFrameEngine }: UseBallGestureParams) {
  const {
    x,
    y,
    vx,
    vy,

    isDragging,
    isSimulating,

    arenaWidth,
    arenaHeight,
    activeMode,
  } = state;

  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const canGrab = useSharedValue(false);

  const panConfig = {
    minDistance: 0,
    onBegin: (event: { x: number; y: number }) => {
      "worklet";

      const width = arenaWidth.get();
      const height = arenaHeight.get();
      if (width <= 0 || height <= 0) {
        canGrab.set(false);
        return;
      }

      const touchX = event.x - width / 2;
      const touchY = event.y - height / 2;
      const dist = Math.hypot(touchX - x.get(), touchY - y.get());

      if (dist > GRAB_RADIUS) {
        canGrab.set(false);
        return;
      }

      canGrab.set(true);
      cancelAnimation(x);
      cancelAnimation(y);

      isSimulating.set(false);
      scheduleOnRN(startFrameEngine, false);
      isDragging.set(true);

      dragStartX.set(x.get());
      dragStartY.set(y.get());
      vx.set(0);
      vy.set(0);
    },
    onUpdate: (event: {
      translationX: number;
      translationY: number;
      velocityX: number;
      velocityY: number;
    }) => {
      "worklet";

      if (!canGrab.get()) {
        return;
      }
      const { maxX, maxY } = getArenaBounds(arenaWidth.get(), arenaHeight.get());

      x.set(clamp(dragStartX.get() + event.translationX, -maxX, maxX));
      y.set(clamp(dragStartY.get() + event.translationY, -maxY, maxY));

      vx.set(event.velocityX);
      vy.set(event.velocityY);
    },
    onDeactivate: (event: { velocityX: number; velocityY: number }) => {
      "worklet";

      if (!canGrab.get()) {
        return;
      }
      canGrab.set(false);
      isDragging.set(false);

      const launchVx = clamp(event.velocityX, -MAX_THROW_SPEED, MAX_THROW_SPEED);
      const launchVy = clamp(event.velocityY, -MAX_THROW_SPEED, MAX_THROW_SPEED);
      vx.set(launchVx);
      vy.set(launchVy);

      if (activeMode.get() === "decay") {
        startDecay(launchVx, launchVy);
      } else {
        isSimulating.set(true);
        scheduleOnRN(startFrameEngine, true);
      }
    },
    onFinalize: () => {
      "worklet";

      if (canGrab.get()) {
        canGrab.set(false);
        isDragging.set(false);
      }
    },
  };

  return usePanGesture(panConfig);
}
