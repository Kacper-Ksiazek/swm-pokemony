import type { SteeringZoneConfig, SteeringZoneId, TrafficCar, VehicleKind } from "./sensors.types";

export const RAD_TO_DEG = 180 / Math.PI;

export const LANE_COUNT = 6;
export const PLAYER_Y_NORM = 0.77;
export const PLAYER_CAR_WIDTH_NORM = 0.095;
export const PLAYER_CAR_HEIGHT_NORM = 0.18;

export const ROAD_MIN_X = 0.08;
export const ROAD_MAX_X = 0.92;

export const BASE_LATERAL_SPEED = 0.52;
export const MIN_SPEED_KMH = 65;
export const BASE_SPEED_KMH = 120;
export const MAX_SPEED_KMH = 250;
export const INITIAL_LIVES = 3;

export const TRAFFIC_POOL_SIZE = 8;
export const TRAFFIC_COLORS = [
  "#3B82F6",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
] as const;

export const VEHICLE_SPECS: Record<
  VehicleKind,
  {
    widthNorm: number;
    heightNorm: number;
    minSpeed: number;
    maxSpeed: number;
    changeIntervalSec: number;
  }
> = {
  moto: {
    widthNorm: 0.055,
    heightNorm: 0.13,
    minSpeed: 0.4,
    maxSpeed: 0.52,
    changeIntervalSec: 1.3,
  },
  car: {
    widthNorm: 0.095,
    heightNorm: 0.18,
    minSpeed: 0.28,
    maxSpeed: 0.39,
    changeIntervalSec: 2.1,
  },
  bus: {
    widthNorm: 0.12,
    heightNorm: 0.27,
    minSpeed: 0.17,
    maxSpeed: 0.25,
    changeIntervalSec: 3.4,
  },
};

export const VEHICLE_KINDS: VehicleKind[] = [
  "car",
  "moto",
  "bus",
  "car",
  "moto",
  "bus",
  "car",
  "moto",
];

export const STRAIGHT_DEADZONE_DEG = 5;
export const TURN_1_MAX_DEG = 14;
export const TURN_2_MAX_DEG = 24;

export const STEERING_ZONE_MAP: Record<SteeringZoneId, SteeringZoneConfig> = {
  LEFT_3: {
    id: "LEFT_3",
    direction: "left",
    intensity: 3,
    lateralMultiplier: -3.3,
    leanDeg: -23,
  },
  LEFT_2: {
    id: "LEFT_2",
    direction: "left",
    intensity: 2,
    lateralMultiplier: -2.15,
    leanDeg: -15,
  },
  LEFT_1: {
    id: "LEFT_1",
    direction: "left",
    intensity: 1,
    lateralMultiplier: -1.15,
    leanDeg: -8,
  },
  STRAIGHT: {
    id: "STRAIGHT",
    direction: "straight",
    intensity: 0,
    lateralMultiplier: 0,
    leanDeg: 0,
  },
  RIGHT_1: {
    id: "RIGHT_1",
    direction: "right",
    intensity: 1,
    lateralMultiplier: 1.15,
    leanDeg: 8,
  },
  RIGHT_2: {
    id: "RIGHT_2",
    direction: "right",
    intensity: 2,
    lateralMultiplier: 2.15,
    leanDeg: 15,
  },
  RIGHT_3: {
    id: "RIGHT_3",
    direction: "right",
    intensity: 3,
    lateralMultiplier: 3.3,
    leanDeg: 23,
  },
};

export function createInitialTrafficPool(): TrafficCar[] {
  const cars: TrafficCar[] = [];

  for (let i = 0; i < TRAFFIC_POOL_SIZE; i += 1) {
    const kind = VEHICLE_KINDS[i % VEHICLE_KINDS.length];
    const spec = VEHICLE_SPECS[kind];
    const lane = i % LANE_COUNT;
    const x = getLaneCenterX(lane);
    const speed = spec.minSpeed + ((i * 0.037) % (spec.maxSpeed - spec.minSpeed));

    cars.push({
      id: i,
      kind,
      lane,
      targetLane: lane,
      x,
      targetX: x,
      y: -0.22 - i * 0.27,
      speed,
      color: TRAFFIC_COLORS[i % TRAFFIC_COLORS.length],
      widthNorm: spec.widthNorm,
      heightNorm: spec.heightNorm,
      leanDeg: 0,
      laneChangeTimer: spec.changeIntervalSec * (0.6 + (i % 3) * 0.35),
      passed: false,
      active: true,
    });
  }

  return cars;
}

export function getLaneCenterX(lane: number): number {
  "worklet";

  return (lane + 0.5) / LANE_COUNT;
}
