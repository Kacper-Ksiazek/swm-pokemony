import type { TrafficCar, VehicleKind } from "../sensors.types";

import { getLaneCenterX, LANE_COUNT } from "./road.constants";

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
