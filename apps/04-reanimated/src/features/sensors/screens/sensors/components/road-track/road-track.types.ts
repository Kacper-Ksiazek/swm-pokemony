import type { SharedValue } from "react-native-reanimated";

import type { TrafficCar } from "../../sensors.types";

export type RoadTrackProps = {
  width: number;
  height: number;

  playerX: SharedValue<number>;
  playerLeanDeg: SharedValue<number>;
  roadScrollY: SharedValue<number>;

  traffic: SharedValue<TrafficCar[]>;

  hitFlash: SharedValue<number>;
  invulnerableSec: SharedValue<number>;

  liveSpeedKmh: SharedValue<number>;
};

export type LaneDashProps = {
  index: number;
  laneDividerIndex: number;
  roadWidth: number;
  roadHeight: number;
  roadScrollY: SharedValue<number>;
};

export type CurbStripeProps = {
  index: number;
  side: "left" | "right";
  roadHeight: number;
  roadScrollY: SharedValue<number>;
};

export type SpeedStreakProps = {
  index: number;
  side: "left" | "right";
  roadHeight: number;
  roadScrollY: SharedValue<number>;
  liveSpeedKmh: SharedValue<number>;
};

export type TrafficVehicleSpriteProps = {
  index: number;
  roadWidth: number;
  roadHeight: number;
  traffic: SharedValue<TrafficCar[]>;
};

export type PlayerCarProps = {
  width: number;
  height: number;
  playerW: number;
  playerH: number;

  playerX: SharedValue<number>;
  playerLeanDeg: SharedValue<number>;
  invulnerableSec: SharedValue<number>;
  liveSpeedKmh: SharedValue<number>;
};
