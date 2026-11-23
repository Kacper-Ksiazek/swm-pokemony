import { useState } from "react";
import { SensorType, useAnimatedSensor, useSharedValue } from "react-native-reanimated";

import { BASE_SPEED_KMH, createInitialTrafficPool, INITIAL_LIVES } from "../../constants";
import type { GamePhase, RaceStats, SpeedHudState, TrafficCar } from "../../sensors.types";

import { useRacingFrame } from "./engines/use-racing-frame";
import { useRacingGameActions } from "./hooks/use-racing-game-actions";
import { useSpeedHudPoll } from "./hooks/use-speed-hud-poll";
import type { RacingGameSharedState } from "./use-racing-game.types";

/** Racing demo: device tilt steering, pedals, traffic, score, and lives on the UI thread. */
export function useRacingGame(isFocused: boolean) {
  const rotation = useAnimatedSensor(SensorType.ROTATION);

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [stats, setStats] = useState<RaceStats>({
    score: 0,
    overtaken: 0,
    bestScore: 0,
    streak: 0,
    lives: INITIAL_LIVES,
  });
  const [speedHud, setSpeedHud] = useState<SpeedHudState>({
    liveSpeedKmh: BASE_SPEED_KMH,
    pedalState: "coast",
  });

  const phaseValue = useSharedValue<GamePhase>("ready");

  const playerX = useSharedValue(0.5);
  const playerLeanDeg = useSharedValue(0);
  const roadScrollY = useSharedValue(0);

  const traffic = useSharedValue<TrafficCar[]>(createInitialTrafficPool());
  const rngSeed = useSharedValue(1337);

  const brakePressed = useSharedValue(false);
  const gasPressed = useSharedValue(false);
  const lastPedal = useSharedValue<"brake" | "gas">("gas");

  const hitFlash = useSharedValue(0);
  const invulnerableSec = useSharedValue(0);

  const baseSpeedKmh = useSharedValue(BASE_SPEED_KMH);
  const liveSpeedKmh = useSharedValue(BASE_SPEED_KMH);

  const state: RacingGameSharedState = {
    phaseValue,

    playerX,
    playerLeanDeg,
    roadScrollY,

    traffic,
    rngSeed,

    brakePressed,
    gasPressed,
    lastPedal,

    hitFlash,
    invulnerableSec,

    baseSpeedKmh,
    liveSpeedKmh,
  };

  const {
    handleOvertake,
    handleCollision,
    startGame,
    togglePause,
    setBrakePressed,
    setGasPressed,
  } = useRacingGameActions({
    ...state,
    setPhase,
    setStats,
  });

  useRacingFrame({
    state,
    rotation,
    rnHandlers: { handleOvertake, handleCollision },
    isActive: isFocused,
  });

  useSpeedHudPoll({
    isFocused,
    liveSpeedKmh,
    brakePressed,
    gasPressed,
    lastPedal,
    setSpeedHud,
  });

  return {
    phase,
    stats,
    speedHud,

    playerX,
    playerLeanDeg,
    roadScrollY,
    traffic,
    hitFlash,
    invulnerableSec,
    liveSpeedKmh,
    brakePressed,
    gasPressed,

    startGame,
    togglePause,
    setBrakePressed,
    setGasPressed,
  };
}
