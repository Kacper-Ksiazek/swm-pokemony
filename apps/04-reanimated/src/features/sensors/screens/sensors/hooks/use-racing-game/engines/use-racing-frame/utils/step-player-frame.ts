import {
  BASE_LATERAL_SPEED,
  BASE_SPEED_KMH,
  LANE_COUNT,
  MAX_SPEED_KMH,
  MIN_SPEED_KMH,
  ROAD_MAX_X,
  ROAD_MIN_X,
} from "../../../../../constants";
import type { SteeringZoneConfig } from "../../../../../sensors.types";
import { resolvePedalState } from "../../../utils/resolve-pedal-state";
import type { PlayerFrameStepResult, StepPlayerFrameState } from "../use-racing-frame.types";

type StepPlayerFrameParams = {
  dt: number;
  zone: SteeringZoneConfig;
  state: StepPlayerFrameState;
};

/** Steering lean always; player motion and scroll only while phase is `playing`. */
export function stepPlayerFrame({
  dt,
  zone,
  state,
}: StepPlayerFrameParams): PlayerFrameStepResult | null {
  "worklet";

  const {
    phaseValue,
    playerLeanDeg,
    playerX,
    roadScrollY,
    hitFlash,
    invulnerableSec,
    brakePressed,
    gasPressed,
    lastPedal,
    baseSpeedKmh,
    liveSpeedKmh,
  } = state;

  const currentLean = playerLeanDeg.get();
  playerLeanDeg.set(currentLean + (zone.leanDeg - currentLean) * Math.min(1, dt * 18));

  if (phaseValue.get() !== "playing") {
    return null;
  }

  const currentFlash = hitFlash.get();
  if (currentFlash > 0) {
    hitFlash.set(Math.max(0, currentFlash - dt * 2.5));
  }

  const currentInvuln = invulnerableSec.get();
  if (currentInvuln > 0) {
    invulnerableSec.set(Math.max(0, currentInvuln - dt));
  }

  const nextX = playerX.get() + zone.lateralMultiplier * BASE_LATERAL_SPEED * dt;
  playerX.set(Math.max(ROAD_MIN_X, Math.min(ROAD_MAX_X, nextX)));

  const pedal = resolvePedalState(brakePressed.get(), gasPressed.get(), lastPedal.get());
  const cruiseSpeed = baseSpeedKmh.get();
  const targetSpeed =
    pedal === "gas" ? MAX_SPEED_KMH : pedal === "brake" ? MIN_SPEED_KMH : cruiseSpeed;

  const accelRate = pedal === "brake" ? 5.5 : pedal === "gas" ? 3.2 : 2.2;
  const currentSpeed = liveSpeedKmh.get();
  const smoothedSpeed = currentSpeed + (targetSpeed - currentSpeed) * Math.min(1, dt * accelRate);
  liveSpeedKmh.set(smoothedSpeed);

  const forwardRate = 0.72 * (smoothedSpeed / BASE_SPEED_KMH);
  roadScrollY.set((roadScrollY.get() + forwardRate * dt) % 1);

  const px = playerX.get();
  const playerLane = Math.max(0, Math.min(LANE_COUNT - 1, Math.floor(px * LANE_COUNT)));

  return { forwardRate, playerLane, px };
}
