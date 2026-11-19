import { useCallback, useEffect, useState } from "react";
import {
  SensorType,
  useAnimatedSensor,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import * as Haptics from "expo-haptics";

import {
  BASE_LATERAL_SPEED,
  BASE_SPEED_KMH,
  createInitialTrafficPool,
  getLaneCenterX,
  INITIAL_LIVES,
  LANE_COUNT,
  MAX_SPEED_KMH,
  MIN_SPEED_KMH,
  PLAYER_CAR_HEIGHT_NORM,
  PLAYER_CAR_WIDTH_NORM,
  PLAYER_Y_NORM,
  ROAD_MAX_X,
  ROAD_MIN_X,
  TRAFFIC_COLORS,
  VEHICLE_KINDS,
  VEHICLE_SPECS,
} from "../sensors.constants";
import type { GamePhase, PedalState, RaceStats, SpeedHudState, TrafficCar } from "../sensors.types";
import { classifySteeringZone, resolveSteeringAngleDeg } from "../utils/steering-math";

const HUD_POLL_MS = 80;

export function useRacingGame(isFocused: boolean) {
  const rotation = useAnimatedSensor(SensorType.ROTATION);

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [stats, setStats] = useState<RaceStats>({
    score: 0,
    overtaken: 0,
    bestScore: 0,
    streak: 0,
    lives: INITIAL_LIVES,
  });
  const [speedHud, setSpeedHud] = useState<SpeedHudState>({
    liveSpeedKmh: BASE_SPEED_KMH,
    pedalState: "coast",
  });

  const phaseValue = useSharedValue<GamePhase>("ready");
  const playerX = useSharedValue(0.5);
  const playerLeanDeg = useSharedValue(0);
  const roadScrollY = useSharedValue(0);
  const traffic = useSharedValue<TrafficCar[]>(createInitialTrafficPool());
  const rngSeed = useSharedValue(1337);

  const brakePressed = useSharedValue(false);
  const gasPressed = useSharedValue(false);
  const lastPedal = useSharedValue<"brake" | "gas">("gas");

  const hitFlash = useSharedValue(0);
  const invulnerableSec = useSharedValue(0);
  const baseSpeedKmh = useSharedValue(BASE_SPEED_KMH);
  const liveSpeedKmh = useSharedValue(BASE_SPEED_KMH);

  const handleOvertake = useCallback(() => {
    setStats((prev) => {
      const nextStreak = prev.streak + 1;
      const nextOvertaken = prev.overtaken + 1;
      const nextScore = prev.score + 100 + nextStreak * 15;
      const nextBaseSpeed = Math.min(MAX_SPEED_KMH - 40, BASE_SPEED_KMH + nextOvertaken * 3);
      baseSpeedKmh.set(nextBaseSpeed);

      return {
        ...prev,
        score: nextScore,
        overtaken: nextOvertaken,
        bestScore: Math.max(prev.bestScore, nextScore),
        streak: nextStreak,
      };
    });
  }, [baseSpeedKmh]);

  const handleCollision = useCallback(() => {
    setStats((prev) => {
      const nextLives = Math.max(0, prev.lives - 1);
      const nextBaseSpeed = Math.max(BASE_SPEED_KMH, baseSpeedKmh.get() - 20);
      baseSpeedKmh.set(nextBaseSpeed);

      if (nextLives === 0) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        phaseValue.set("gameover");
        setPhase("gameover");
      } else {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }

      return {
        ...prev,
        lives: nextLives,
        streak: 0,
      };
    });
  }, [baseSpeedKmh, phaseValue]);

  const resetRace = useCallback(() => {
    playerX.set(0.5);
    playerLeanDeg.set(0);
    roadScrollY.set(0);
    traffic.set(createInitialTrafficPool());
    hitFlash.set(0);
    invulnerableSec.set(0);
    baseSpeedKmh.set(BASE_SPEED_KMH);
    liveSpeedKmh.set(BASE_SPEED_KMH);
    brakePressed.set(false);
    gasPressed.set(false);

    setStats((prev) => ({
      score: 0,
      overtaken: 0,
      bestScore: prev.bestScore,
      streak: 0,
      lives: INITIAL_LIVES,
    }));
  }, [
    baseSpeedKmh,
    brakePressed,
    gasPressed,
    hitFlash,
    invulnerableSec,
    liveSpeedKmh,
    playerLeanDeg,
    playerX,
    roadScrollY,
    traffic,
  ]);

  const startGame = useCallback(() => {
    resetRace();
    phaseValue.set("playing");
    setPhase("playing");
  }, [phaseValue, resetRace]);

  const togglePause = useCallback(() => {
    setPhase((prev) => {
      if (prev === "playing") {
        phaseValue.set("paused");
        return "paused";
      }
      if (prev === "paused") {
        phaseValue.set("playing");
        return "playing";
      }
      return prev;
    });
  }, [phaseValue]);

  const setBrakePressed = useCallback(
    (pressed: boolean) => {
      brakePressed.set(pressed);
      if (pressed) {
        lastPedal.set("brake");
      }
    },
    [brakePressed, lastPedal],
  );

  const setGasPressed = useCallback(
    (pressed: boolean) => {
      gasPressed.set(pressed);
      if (pressed) {
        lastPedal.set("gas");
      }
    },
    [gasPressed, lastPedal],
  );

  useFrameCallback((frameInfo) => {
    const dt = Math.min((frameInfo.timeSincePreviousFrame ?? 16.6) / 1000, 0.05);
    const val = rotation.sensor.value;

    const angle = resolveSteeringAngleDeg(val.roll, val.interfaceOrientation);
    const zone = classifySteeringZone(angle);

    const currentLean = playerLeanDeg.get();
    playerLeanDeg.set(currentLean + (zone.leanDeg - currentLean) * Math.min(1, dt * 18));

    if (phaseValue.get() !== "playing") {
      return;
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

    const isBrake = brakePressed.get();
    const isGas = gasPressed.get();
    const pedal: PedalState =
      isBrake && isGas ? lastPedal.get() : isBrake ? "brake" : isGas ? "gas" : "coast";
    const cruiseSpeed = baseSpeedKmh.get();
    const targetSpeed =
      pedal === "gas" ? MAX_SPEED_KMH : pedal === "brake" ? MIN_SPEED_KMH : cruiseSpeed;

    const accelRate = pedal === "brake" ? 5.5 : pedal === "gas" ? 3.2 : 2.2;
    const currentSpeed = liveSpeedKmh.get();
    const smoothedSpeed = currentSpeed + (targetSpeed - currentSpeed) * Math.min(1, dt * accelRate);
    liveSpeedKmh.set(smoothedSpeed);

    const forwardRate = 0.72 * (smoothedSpeed / BASE_SPEED_KMH);
    roadScrollY.set((roadScrollY.get() + forwardRate * dt) % 1);

    let seed = rngSeed.get();
    const nextRand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const cars = traffic.get();
    const px = playerX.get();
    const playerLane = Math.max(0, Math.min(LANE_COUNT - 1, Math.floor(px * LANE_COUNT)));
    let collidedThisFrame = false;
    let overtookCount = 0;

    const updatedCars = cars.map((car) => {
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

      if (!nextPassed && nextY > PLAYER_Y_NORM + PLAYER_CAR_HEIGHT_NORM * 0.45) {
        nextPassed = true;
        overtookCount += 1;
      }

      if (nextY > 1.28) {
        const r1 = nextRand();
        const r2 = nextRand();
        const r3 = nextRand();

        nextKind = VEHICLE_KINDS[Math.floor(r1 * VEHICLE_KINDS.length)];
        const spec = VEHICLE_SPECS[nextKind];
        nextWidthNorm = spec.widthNorm;
        nextHeightNorm = spec.heightNorm;
        nextSpeed = spec.minSpeed + r2 * (spec.maxSpeed - spec.minSpeed);
        nextColor = TRAFFIC_COLORS[Math.floor(r3 * TRAFFIC_COLORS.length)];

        nextLane = r1 < 0.55 ? playerLane : Math.floor(r2 * LANE_COUNT);
        nextTargetLane = nextLane;
        nextCarX = getLaneCenterX(nextLane);
        nextTargetX = nextCarX;

        let topMostY = 0;
        for (let j = 0; j < cars.length; j += 1) {
          const other = cars[j];
          if (other.id !== car.id && other.lane === nextLane && other.y < topMostY) {
            topMostY = other.y - (other.heightNorm + nextHeightNorm) * 0.5 - 0.12;
          }
        }
        nextY = Math.min(-0.26 - r3 * 0.3, topMostY);
        nextLean = 0;
        nextTimer = spec.changeIntervalSec * (0.6 + r2 * 0.8);
        nextPassed = false;
      }

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
        leanDeg: nextLean,
        laneChangeTimer: nextTimer,
        passed: nextPassed,
      };
    });

    for (let i = 0; i < updatedCars.length; i += 1) {
      for (let j = 0; j < updatedCars.length; j += 1) {
        if (i === j) {
          continue;
        }
        const behind = updatedCars[i];
        const ahead = updatedCars[j];
        if (behind.lane !== ahead.lane || behind.y >= ahead.y) {
          continue;
        }
        const minGap = (behind.heightNorm + ahead.heightNorm) * 0.5 + 0.06;
        if (ahead.y - behind.y < minGap) {
          behind.y = ahead.y - minGap;
          if (behind.speed > ahead.speed) {
            behind.speed = ahead.speed;
          }
        }
      }
    }

    for (let i = 0; i < updatedCars.length; i += 1) {
      const car = updatedCars[i];
      const dx = Math.abs(px - car.x);
      const dy = Math.abs(PLAYER_Y_NORM - car.y);
      const hitW = (PLAYER_CAR_WIDTH_NORM + car.widthNorm) * 0.36;
      const hitH = (PLAYER_CAR_HEIGHT_NORM + car.heightNorm) * 0.38;

      if (dx < hitW && dy < hitH && invulnerableSec.get() <= 0) {
        collidedThisFrame = true;
        break;
      }
    }

    rngSeed.set(seed);
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
  });

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const poll = () => {
      const speed = Math.round(liveSpeedKmh.get());
      const isBrake = brakePressed.get();
      const isGas = gasPressed.get();
      const pedal: PedalState =
        isBrake && isGas ? lastPedal.get() : isBrake ? "brake" : isGas ? "gas" : "coast";

      setSpeedHud((prev) =>
        prev.liveSpeedKmh === speed && prev.pedalState === pedal
          ? prev
          : { liveSpeedKmh: speed, pedalState: pedal },
      );
    };

    poll();
    const id = setInterval(poll, HUD_POLL_MS);
    return () => clearInterval(id);
  }, [brakePressed, gasPressed, isFocused, lastPedal, liveSpeedKmh]);

  return {
    phase,
    stats,
    speedHud,
    playerX,
    playerLeanDeg,
    roadScrollY,
    traffic,
    hitFlash,
    invulnerableSec,
    liveSpeedKmh,
    brakePressed,
    gasPressed,
    startGame,
    togglePause,
    setBrakePressed,
    setGasPressed,
  };
}
