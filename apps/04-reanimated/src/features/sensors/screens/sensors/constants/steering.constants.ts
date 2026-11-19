import type { SteeringZoneConfig, SteeringZoneId } from "../sensors.types";

export const RAD_TO_DEG = 180 / Math.PI;

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
