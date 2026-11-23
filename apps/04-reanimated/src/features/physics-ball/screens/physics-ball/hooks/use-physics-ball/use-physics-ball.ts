import { useEffect } from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

import { useDecayPhysics } from "./engines/use-decay-physics";
import { useFramePhysics } from "./engines/use-frame-physics";
import { useBallGesture } from "./hooks/use-ball-gesture";
import { useBallTelemetry } from "./hooks/use-ball-telemetry";
import type { PhysicsMode, PhysicsSharedState, WallHit } from "./use-physics-ball.types";
import { clamp, getArenaBounds } from "./utils/physics-math";

/** Coordinates physics simulation, pan gestures, and live telemetry for the ball arena. */
export function usePhysicsBall(mode: PhysicsMode) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const vx = useSharedValue(0);
  const vy = useSharedValue(0);

  const isDragging = useSharedValue(false);
  const isSimulating = useSharedValue(false);

  const bounces = useSharedValue(0);
  const lastWall = useSharedValue<WallHit>("none");

  const arenaWidth = useSharedValue(0);
  const arenaHeight = useSharedValue(0);
  const activeMode = useSharedValue<PhysicsMode>(mode);

  const state: PhysicsSharedState = {
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
  };

  const speed = useDerivedValue(() => Math.hypot(vx.get(), vy.get()));

  const ballScale = useDerivedValue(() => computeBallScale(isDragging.get(), speed.get()));

  const telemetry = useBallTelemetry(state, speed);
  const { startFrameEngine } = useFramePhysics({ state, mode, status: telemetry.status });
  const { startDecay } = useDecayPhysics(state);

  const panGesture = useBallGesture({ state, startDecay, startFrameEngine });

  useEffect(() => {
    activeMode.set(mode);
    isSimulating.set(false);

    cancelAnimation(x);
    cancelAnimation(y);
    startFrameEngine(false);

    vx.set(0);
    vy.set(0);
  }, [activeMode, isSimulating, mode, startFrameEngine, vx, vy, x, y]);

  const ballAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: ballScale.get() }],
  }));

  const handleArenaLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    arenaWidth.set(width);
    arenaHeight.set(height);

    const { maxX, maxY } = getArenaBounds(width, height);

    x.set(clamp(x.get(), -maxX, maxX));
    y.set(clamp(y.get(), -maxY, maxY));
  };

  const reset = () => {
    cancelAnimation(x);
    cancelAnimation(y);

    isSimulating.set(false);
    startFrameEngine(false);
    isDragging.set(false);

    x.set(0);
    y.set(0);
    vx.set(0);
    vy.set(0);

    bounces.set(0);
    lastWall.set("none");
  };

  return {
    telemetry,
    panGesture,
    ballAnimatedStyle,
    handleArenaLayout,
    reset,
  };
}

function computeBallScale(isDragging: boolean, speed: number): number {
  "worklet";

  if (isDragging) {
    return 1.1;
  }

  return 1 + Math.min(speed / 4000, 0.08);
}
