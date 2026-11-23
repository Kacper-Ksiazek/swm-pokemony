import { useEffect } from "react";
import { useFrameCallback } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { classifySteeringZone, resolveSteeringAngleDeg } from "../../../../utils/steering-math";
import type { UseRacingFrameParams } from "./use-racing-frame.types";
import { createLcgRand } from "./utils/lcg-rand";
import { detectPlayerTrafficHit } from "./utils/detect-player-traffic-hit";
import { stepPlayerFrame } from "./utils/step-player-frame";
import { stepTrafficPool } from "./utils/step-traffic-pool";

/** Per-frame steering, speed, traffic simulation, overtakes, and collisions on the UI thread. */
export function useRacingFrame({ state, rotation, rnHandlers, isActive }: UseRacingFrameParams) {
  const {
    phaseValue,

    playerX,
    playerLeanDeg,
    roadScrollY,

    traffic,
    rngSeed,

    brakePressed,
    gasPressed,
    lastPedal,

    hitFlash,
    invulnerableSec,

    baseSpeedKmh,
    liveSpeedKmh,
  } = state;

  const { handleOvertake, handleCollision } = rnHandlers;

  const frameCallback = useFrameCallback((frameInfo) => {
    const dt = Math.min((frameInfo.timeSincePreviousFrame ?? 16.6) / 1000, 0.05);
    const val = rotation.sensor.value;

    const angle = resolveSteeringAngleDeg(val.roll, val.interfaceOrientation);
    const zone = classifySteeringZone(angle);

    const playerStep = stepPlayerFrame({
      dt,
      zone,
      state: {
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
      },
    });

    if (!playerStep) {
      return;
    }

    const lcg = createLcgRand(rngSeed.get());
    const { updatedCars, overtookCount } = stepTrafficPool({
      cars: traffic.get(),
      dt,
      forwardRate: playerStep.forwardRate,
      playerLane: playerStep.playerLane,
      nextRand: lcg.next,
    });

    const collidedThisFrame = detectPlayerTrafficHit(updatedCars, playerStep.px, invulnerableSec);

    rngSeed.set(lcg.getSeed());
    traffic.set(updatedCars);

    if (overtookCount > 0) {
      for (let i = 0; i < overtookCount; i += 1) {
        scheduleOnRN(handleOvertake);
      }
    }

    if (collidedThisFrame) {
      invulnerableSec.set(1.2);
      hitFlash.set(1);
      scheduleOnRN(handleCollision);
    }
  }, false);

  useEffect(() => {
    frameCallback.setActive(isActive);
  }, [frameCallback, isActive]);
}
