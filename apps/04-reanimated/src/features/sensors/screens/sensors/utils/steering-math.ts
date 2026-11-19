import {
  RAD_TO_DEG,
  STEERING_ZONE_MAP,
  STRAIGHT_DEADZONE_DEG,
  TURN_1_MAX_DEG,
  TURN_2_MAX_DEG,
} from "../constants";
import type { SteeringZoneConfig, SteeringZoneId } from "../sensors.types";

/**
 * Resolves signed steering angle (in degrees) from device roll in landscape.
 * Negative = steer left, positive = steer right.
 */
export function resolveSteeringAngleDeg(rollRad: number, interfaceOrientation: number): number {
  "worklet";

  const rollDeg = rollRad * RAD_TO_DEG;

  if (interfaceOrientation === 270) {
    return rollDeg;
  }

  return -rollDeg;
}

export function classifySteeringZone(angleDeg: number): SteeringZoneConfig {
  "worklet";

  const absDeg = Math.abs(angleDeg);

  if (absDeg < STRAIGHT_DEADZONE_DEG) {
    return STEERING_ZONE_MAP.STRAIGHT;
  }

  let zoneId: SteeringZoneId;

  if (angleDeg < 0) {
    if (absDeg < TURN_1_MAX_DEG) {
      zoneId = "LEFT_1";
    } else if (absDeg < TURN_2_MAX_DEG) {
      zoneId = "LEFT_2";
    } else {
      zoneId = "LEFT_3";
    }
  } else if (absDeg < TURN_1_MAX_DEG) {
    zoneId = "RIGHT_1";
  } else if (absDeg < TURN_2_MAX_DEG) {
    zoneId = "RIGHT_2";
  } else {
    zoneId = "RIGHT_3";
  }

  return STEERING_ZONE_MAP[zoneId];
}
