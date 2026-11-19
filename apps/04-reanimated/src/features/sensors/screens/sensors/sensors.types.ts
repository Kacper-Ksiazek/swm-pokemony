export type SteeringIntensity = 0 | 1 | 2 | 3;

export type SteeringDirection = "left" | "straight" | "right";

export type SteeringZoneId =
  "LEFT_3" | "LEFT_2" | "LEFT_1" | "STRAIGHT" | "RIGHT_1" | "RIGHT_2" | "RIGHT_3";

export type SteeringZoneConfig = {
  id: SteeringZoneId;
  direction: SteeringDirection;
  intensity: SteeringIntensity;
  lateralMultiplier: number;
  leanDeg: number;
};

export type GamePhase = "ready" | "playing" | "paused" | "gameover";

export type PedalState = "brake" | "coast" | "gas";

export type VehicleKind = "moto" | "car" | "bus";

export type TrafficCar = {
  id: number;
  kind: VehicleKind;

  lane: number;
  targetLane: number;

  x: number;
  targetX: number;
  y: number;

  speed: number;
  color: string;

  widthNorm: number;
  heightNorm: number;
  leanDeg: number;

  laneChangeTimer: number;
  passed: boolean;
  active: boolean;
};

export type RaceStats = {
  score: number;
  overtaken: number;
  bestScore: number;
  streak: number;
  lives: number;
};

export type SpeedHudState = {
  liveSpeedKmh: number;
  pedalState: PedalState;
};
