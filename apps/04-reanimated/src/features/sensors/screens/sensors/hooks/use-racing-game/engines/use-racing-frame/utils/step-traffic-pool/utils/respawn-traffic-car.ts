import {
  getLaneCenterX,
  LANE_COUNT,
  TRAFFIC_COLORS,
  VEHICLE_KINDS,
  VEHICLE_SPECS,
} from "../../../../../../../constants";
import type { TrafficCar } from "../../../../../../../sensors.types";
import type { RespawnTrafficCarParams } from "../step-traffic-pool.types";

/** Teleport an off-screen car to the top band with new kind, lane, and spaced Y. */
export function respawnTrafficCar({
  car,
  cars,
  playerLane,
  nextRand,
}: RespawnTrafficCarParams): TrafficCar {
  "worklet";

  const r1 = nextRand();
  const r2 = nextRand();
  const r3 = nextRand();

  const nextKind = VEHICLE_KINDS[Math.floor(r1 * VEHICLE_KINDS.length)];
  const spec = VEHICLE_SPECS[nextKind];
  const nextWidthNorm = spec.widthNorm;
  const nextHeightNorm = spec.heightNorm;
  const nextSpeed = spec.minSpeed + r2 * (spec.maxSpeed - spec.minSpeed);
  const nextColor = TRAFFIC_COLORS[Math.floor(r3 * TRAFFIC_COLORS.length)];

  const nextLane = r1 < 0.55 ? playerLane : Math.floor(r2 * LANE_COUNT);
  const nextTargetLane = nextLane;
  const nextCarX = getLaneCenterX(nextLane);
  const nextTargetX = nextCarX;

  let topMostY = 0;
  for (let j = 0; j < cars.length; j += 1) {
    const other = cars[j];
    if (other.id !== car.id && other.lane === nextLane && other.y < topMostY) {
      topMostY = other.y - (other.heightNorm + nextHeightNorm) * 0.5 - 0.12;
    }
  }
  const nextY = Math.min(-0.26 - r3 * 0.3, topMostY);
  const nextTimer = spec.changeIntervalSec * (0.6 + r2 * 0.8);

  return {
    ...car,
    kind: nextKind,

    lane: nextLane,
    targetLane: nextTargetLane,

    x: nextCarX,
    targetX: nextTargetX,
    y: nextY,

    speed: nextSpeed,
    color: nextColor,

    widthNorm: nextWidthNorm,
    heightNorm: nextHeightNorm,
    leanDeg: 0,

    laneChangeTimer: nextTimer,
    passed: false,
  };
}
