import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { SharedValue } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import {
  BASE_SPEED_KMH,
  createInitialTrafficPool,
  INITIAL_LIVES,
  MAX_SPEED_KMH,
} from "../../../constants";
import type { GamePhase, RaceStats, TrafficCar } from "../../../sensors.types";

type UseRacingGameActionsParams = {
  phaseValue: SharedValue<GamePhase>;

  playerX: SharedValue<number>;
  playerLeanDeg: SharedValue<number>;
  roadScrollY: SharedValue<number>;

  traffic: SharedValue<TrafficCar[]>;

  hitFlash: SharedValue<number>;
  invulnerableSec: SharedValue<number>;

  baseSpeedKmh: SharedValue<number>;
  liveSpeedKmh: SharedValue<number>;

  brakePressed: SharedValue<boolean>;
  gasPressed: SharedValue<boolean>;
  lastPedal: SharedValue<"brake" | "gas">;

  setPhase: Dispatch<SetStateAction<GamePhase>>;
  setStats: Dispatch<SetStateAction<RaceStats>>;
};

/** React-thread race controls, stats updates, and haptics for overtakes and collisions. */
export function useRacingGameActions({
  phaseValue,
  playerX,
  playerLeanDeg,
  roadScrollY,
  traffic,
  hitFlash,
  invulnerableSec,
  baseSpeedKmh,
  liveSpeedKmh,
  brakePressed,
  gasPressed,
  lastPedal,
  setPhase,
  setStats,
}: UseRacingGameActionsParams) {
  const handleOvertake = useCallback(() => {
    setStats((prev) => {
      const nextStreak = prev.streak + 1;
      const nextOvertaken = prev.overtaken + 1;
      const nextScore = prev.score + 100 + nextStreak * 15;
      const nextBaseSpeed = Math.min(MAX_SPEED_KMH - 40, BASE_SPEED_KMH + nextOvertaken * 3);
      baseSpeedKmh.set(nextBaseSpeed);

      return {
        ...prev,
        score: nextScore,
        overtaken: nextOvertaken,
        bestScore: Math.max(prev.bestScore, nextScore),
        streak: nextStreak,
      };
    });
  }, [baseSpeedKmh, setStats]);

  const handleCollision = useCallback(() => {
    let nextLives = 0;

    setStats((prev) => {
      nextLives = Math.max(0, prev.lives - 1);
      const nextBaseSpeed = Math.max(BASE_SPEED_KMH, baseSpeedKmh.get() - 20);
      baseSpeedKmh.set(nextBaseSpeed);

      return {
        ...prev,
        lives: nextLives,
        streak: 0,
      };
    });

    if (nextLives === 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      phaseValue.set("gameover");
      setPhase("gameover");
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
  }, [baseSpeedKmh, phaseValue, setPhase, setStats]);

  const resetRace = useCallback(() => {
    playerX.set(0.5);
    playerLeanDeg.set(0);
    roadScrollY.set(0);
    traffic.set(createInitialTrafficPool());

    hitFlash.set(0);
    invulnerableSec.set(0);

    baseSpeedKmh.set(BASE_SPEED_KMH);
    liveSpeedKmh.set(BASE_SPEED_KMH);
    brakePressed.set(false);
    gasPressed.set(false);

    setStats((prev) => ({
      score: 0,
      overtaken: 0,
      bestScore: prev.bestScore,
      streak: 0,
      lives: INITIAL_LIVES,
    }));
  }, [
    baseSpeedKmh,
    brakePressed,
    gasPressed,
    hitFlash,
    invulnerableSec,
    liveSpeedKmh,
    playerLeanDeg,
    playerX,
    roadScrollY,
    setStats,
    traffic,
  ]);

  const startGame = useCallback(() => {
    resetRace();
    phaseValue.set("playing");
    setPhase("playing");
  }, [phaseValue, resetRace, setPhase]);

  const togglePause = useCallback(() => {
    setPhase((prev) => {
      if (prev === "playing") {
        phaseValue.set("paused");
        return "paused";
      }

      if (prev === "paused") {
        phaseValue.set("playing");
        return "playing";
      }

      return prev;
    });
  }, [phaseValue, setPhase]);

  const setBrakePressed = useCallback(
    (pressed: boolean) => {
      brakePressed.set(pressed);

      if (pressed) {
        lastPedal.set("brake");
      }
    },
    [brakePressed, lastPedal],
  );

  const setGasPressed = useCallback(
    (pressed: boolean) => {
      gasPressed.set(pressed);

      if (pressed) {
        lastPedal.set("gas");
      }
    },
    [gasPressed, lastPedal],
  );

  return {
    handleOvertake,
    handleCollision,

    startGame,
    togglePause,

    setBrakePressed,
    setGasPressed,
  };
}
