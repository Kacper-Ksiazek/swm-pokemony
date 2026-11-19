import {
  getLaneCenterX,
  LANE_COUNT,
  PLAYER_CAR_HEIGHT_NORM,
  PLAYER_Y_NORM,
  VEHICLE_SPECS,
} from "../../../../../../../constants";
import type { StepOneTrafficCarParams, StepOneTrafficCarResult } from "../step-traffic-pool.types";
import { respawnTrafficCar } from "./respawn-traffic-car";

export function stepOneTrafficCar({
  car,
  cars,
  dt,
  forwardRate,
  playerLane,
  nextRand,
}: StepOneTrafficCarParams): StepOneTrafficCarResult {
  "worklet";

  const relativeSpeed = forwardRate - car.speed;
  let nextY = car.y + relativeSpeed * dt;
  let nextPassed = car.passed;

  let nextLane = car.lane;
  let nextTargetLane = car.targetLane;
  let nextCarX = car.x;
  let nextTargetX = car.targetX;

  let nextKind = car.kind;
  let nextSpeed = car.speed;
  let nextColor = car.color;
  let nextWidthNorm = car.widthNorm;
  let nextHeightNorm = car.heightNorm;
  let nextLean = car.leanDeg;

  let nextTimer = car.laneChangeTimer - dt;

  if (nextTimer <= 0 && nextY > -0.1 && nextY < 0.72) {
    const spec = VEHICLE_SPECS[nextKind];
    const laneCenter = getLaneCenterX(nextLane);
    const maxSway = Math.max(0.012, (1 / LANE_COUNT - nextWidthNorm) * 0.42);
    nextTargetX = laneCenter + (nextRand() * 2 - 1) * maxSway;
    nextTimer = spec.changeIntervalSec * (0.45 + nextRand() * 0.55);
  }

  const dxToTarget = nextTargetX - nextCarX;
  if (Math.abs(dxToTarget) > 0.0015) {
    const stepX = dxToTarget * Math.min(1, dt * 3.8);
    nextCarX += stepX;
    nextLean = Math.max(-10, Math.min(10, dxToTarget * 90));
  } else {
    nextCarX = nextTargetX;
    nextLean = nextLean * Math.max(0, 1 - dt * 10);
  }

  let overtook = 0;
  if (!nextPassed && nextY > PLAYER_Y_NORM + PLAYER_CAR_HEIGHT_NORM * 0.45) {
    nextPassed = true;
    overtook = 1;
  }

  if (nextY > 1.28) {
    const respawned = respawnTrafficCar({ car, cars, playerLane, nextRand });
    return { car: respawned, overtook };
  }

  return {
    car: {
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
      leanDeg: nextLean,

      laneChangeTimer: nextTimer,
      passed: nextPassed,
    },
    overtook,
  };
}
