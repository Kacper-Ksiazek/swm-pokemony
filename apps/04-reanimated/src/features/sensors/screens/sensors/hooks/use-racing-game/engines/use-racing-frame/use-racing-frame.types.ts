import type { AnimatedSensor, SharedValue, ValueRotation } from "react-native-reanimated";

import type { GamePhase, TrafficCar } from "../../../../sensors.types";
import type { RacingGameRnHandlers, RacingGameSharedState } from "../../use-racing-game.types";

export type UseRacingFrameParams = {
  state: RacingGameSharedState;
  rotation: AnimatedSensor<ValueRotation>;
  rnHandlers: RacingGameRnHandlers;
};

export type PlayerFrameStepResult = {
  forwardRate: number;
  playerLane: number;
  px: number;
};

export type TrafficPoolStepResult = {
  updatedCars: TrafficCar[];
  overtookCount: number;
};

export type LcgRand = {
  next: () => number;
  getSeed: () => number;
};

export type StepPlayerFrameState = {
  phaseValue: SharedValue<GamePhase>;
  playerLeanDeg: SharedValue<number>;
  playerX: SharedValue<number>;
  roadScrollY: SharedValue<number>;
  hitFlash: SharedValue<number>;
  invulnerableSec: SharedValue<number>;
  brakePressed: SharedValue<boolean>;
  gasPressed: SharedValue<boolean>;
  lastPedal: SharedValue<"brake" | "gas">;
  baseSpeedKmh: SharedValue<number>;
  liveSpeedKmh: SharedValue<number>;
};
