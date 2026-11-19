import type { SharedValue } from "react-native-reanimated";

import type { GamePhase, TrafficCar } from "../../sensors.types";

export type RacingGameSharedState = {
  phaseValue: SharedValue<GamePhase>;

  playerX: SharedValue<number>;
  playerLeanDeg: SharedValue<number>;
  roadScrollY: SharedValue<number>;

  traffic: SharedValue<TrafficCar[]>;
  rngSeed: SharedValue<number>;

  brakePressed: SharedValue<boolean>;
  gasPressed: SharedValue<boolean>;
  lastPedal: SharedValue<"brake" | "gas">;

  hitFlash: SharedValue<number>;
  invulnerableSec: SharedValue<number>;

  baseSpeedKmh: SharedValue<number>;
  liveSpeedKmh: SharedValue<number>;
};

export type RacingGameRnHandlers = {
  handleOvertake: () => void;
  handleCollision: () => void;
};
