import { StyleSheet, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { theme } from "@/components/theme";

import {
  LANE_COUNT,
  PLAYER_CAR_HEIGHT_NORM,
  PLAYER_CAR_WIDTH_NORM,
  PLAYER_Y_NORM,
  TRAFFIC_POOL_SIZE,
} from "../sensors.constants";
import type { TrafficCar } from "../sensors.types";

type RoadTrackProps = {
  width: number;
  height: number;
  playerX: SharedValue<number>;
  playerLeanDeg: SharedValue<number>;
  roadScrollY: SharedValue<number>;
  traffic: SharedValue<TrafficCar[]>;
  hitFlash: SharedValue<number>;
  invulnerableSec: SharedValue<number>;
  liveSpeedKmh: SharedValue<number>;
};

const DASH_COUNT = 8;
const CURB_STRIPE_COUNT = 12;

function LaneDash({
  index,
  laneDividerIndex,
  roadWidth,
  roadHeight,
  roadScrollY,
}: {
  index: number;
  laneDividerIndex: number;
  roadWidth: number;
  roadHeight: number;
  roadScrollY: SharedValue<number>;
}) {
  const step = roadHeight / DASH_COUNT;
  const x = (roadWidth * laneDividerIndex) / LANE_COUNT - 2;

  const animatedStyle = useAnimatedStyle(() => {
    const offset = (roadScrollY.get() * roadHeight + index * step) % roadHeight;
    return {
      transform: [{ translateY: offset - step * 0.5 }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.laneDash,
        {
          left: x,
          height: step * 0.48,
        },
        animatedStyle,
      ]}
    />
  );
}

function CurbStripe({
  index,
  side,
  roadHeight,
  roadScrollY,
}: {
  index: number;
  side: "left" | "right";
  roadHeight: number;
  roadScrollY: SharedValue<number>;
}) {
  const step = roadHeight / CURB_STRIPE_COUNT;
  const isRed = index % 2 === 0;

  const animatedStyle = useAnimatedStyle(() => {
    const offset = (roadScrollY.get() * roadHeight + index * step) % roadHeight;
    return {
      transform: [{ translateY: offset - step }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.curbStripe,
        side === "left" ? styles.curbLeft : styles.curbRight,
        {
          height: step + 1,
          backgroundColor: isRed ? theme.colors.accent : "#F4F4F5",
        },
        animatedStyle,
      ]}
    />
  );
}

function SpeedStreak({
  index,
  side,
  roadHeight,
  roadScrollY,
  liveSpeedKmh,
}: {
  index: number;
  side: "left" | "right";
  roadHeight: number;
  roadScrollY: SharedValue<number>;
  liveSpeedKmh: SharedValue<number>;
}) {
  const step = roadHeight / 4;

  const animatedStyle = useAnimatedStyle(() => {
    const speedRatio = Math.max(0, Math.min(1, (liveSpeedKmh.get() - 130) / 110));
    const offset = (roadScrollY.get() * roadHeight * 1.4 + index * step) % roadHeight;
    return {
      opacity: speedRatio * 0.45,
      transform: [{ translateY: offset - 40 }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.speedStreak,
        side === "left" ? styles.speedStreakLeft : styles.speedStreakRight,
        animatedStyle,
      ]}
    />
  );
}

function TrafficVehicleSprite({
  index,
  roadWidth,
  roadHeight,
  traffic,
}: {
  index: number;
  roadWidth: number;
  roadHeight: number;
  traffic: SharedValue<TrafficCar[]>;
}) {
  const containerStyle = useAnimatedStyle(() => {
    const car = traffic.get()[index];
    if (!car || !car.active) {
      return { opacity: 0 };
    }

    const carW = roadWidth * car.widthNorm;
    const carH = roadHeight * car.heightNorm;

    return {
      opacity: 1,
      width: carW,
      height: carH,
      borderRadius: car.kind === "moto" ? carW * 0.45 : car.kind === "bus" ? 8 : carW * 0.24,
      backgroundColor: car.color,
      transform: [
        { translateX: car.x * roadWidth - carW / 2 },
        { translateY: car.y * roadHeight - carH / 2 },
        { rotate: `${car.leanDeg}deg` },
      ],
    };
  });

  const carWindowStyle = useAnimatedStyle(() => {
    const car = traffic.get()[index];
    return { opacity: car?.kind === "moto" ? 0 : 1 };
  });

  const motoDetailStyle = useAnimatedStyle(() => {
    const car = traffic.get()[index];
    return { opacity: car?.kind === "moto" ? 1 : 0 };
  });

  const busRoofStyle = useAnimatedStyle(() => {
    const car = traffic.get()[index];
    return { opacity: car?.kind === "bus" ? 1 : 0 };
  });

  return (
    <Animated.View style={[styles.carBody, containerStyle]}>
      <Animated.View style={[styles.rivalWindshield, carWindowStyle]} />
      <Animated.View style={[styles.busRoofVent, busRoofStyle]} />
      <Animated.View style={[styles.motoHelmet, motoDetailStyle]} />
      <Animated.View style={[styles.rivalRearWindow, carWindowStyle]} />
      <View style={styles.rivalTaillights}>
        <View style={styles.taillight} />
        <View style={styles.taillight} />
      </View>
    </Animated.View>
  );
}

export function RoadTrack({
  width,
  height,
  playerX,
  playerLeanDeg,
  roadScrollY,
  traffic,
  hitFlash,
  invulnerableSec,
  liveSpeedKmh,
}: RoadTrackProps) {
  const playerW = width * PLAYER_CAR_WIDTH_NORM;
  const playerH = height * PLAYER_CAR_HEIGHT_NORM;

  const playerStyle = useAnimatedStyle(() => {
    const invuln = invulnerableSec.get();
    const blink = invuln > 0 && Math.floor(invuln * 10) % 2 === 0 ? 0.4 : 1;

    return {
      opacity: blink,
      transform: [
        { translateX: playerX.get() * width - playerW / 2 },
        { translateY: PLAYER_Y_NORM * height - playerH / 2 },
        { rotate: `${playerLeanDeg.get()}deg` },
      ],
    };
  });

  const flashStyle = useAnimatedStyle(() => ({
    opacity: hitFlash.get() * 0.42,
  }));

  return (
    <View style={[styles.road, { width, height }]}>
      {Array.from({ length: CURB_STRIPE_COUNT }).map((_, i) => (
        <View key={`curb-${i}`} style={StyleSheet.absoluteFill} pointerEvents="none">
          <CurbStripe index={i} side="left" roadHeight={height} roadScrollY={roadScrollY} />
          <CurbStripe index={i} side="right" roadHeight={height} roadScrollY={roadScrollY} />
        </View>
      ))}

      {Array.from({ length: LANE_COUNT - 1 }, (_, d) => d + 1).map((divider) =>
        Array.from({ length: DASH_COUNT }).map((_, i) => (
          <LaneDash
            key={`dash-${divider}-${i}`}
            index={i}
            laneDividerIndex={divider}
            roadWidth={width}
            roadHeight={height}
            roadScrollY={roadScrollY}
          />
        )),
      )}

      {Array.from({ length: 4 }).map((_, i) => (
        <View key={`streak-${i}`} style={StyleSheet.absoluteFill} pointerEvents="none">
          <SpeedStreak
            index={i}
            side="left"
            roadHeight={height}
            roadScrollY={roadScrollY}
            liveSpeedKmh={liveSpeedKmh}
          />
          <SpeedStreak
            index={i}
            side="right"
            roadHeight={height}
            roadScrollY={roadScrollY}
            liveSpeedKmh={liveSpeedKmh}
          />
        </View>
      ))}

      {Array.from({ length: TRAFFIC_POOL_SIZE }).map((_, i) => (
        <TrafficVehicleSprite
          key={`traffic-${i}`}
          index={i}
          roadWidth={width}
          roadHeight={height}
          traffic={traffic}
        />
      ))}

      <Animated.View
        style={[
          styles.carBody,
          styles.playerCar,
          {
            width: playerW,
            height: playerH,
            borderRadius: playerW * 0.24,
          },
          playerStyle,
        ]}
      >
        <View style={styles.headlights}>
          <View style={styles.headlight} />
          <View style={styles.headlight} />
        </View>
        <View style={styles.racingStripe} />
        <View style={styles.playerWindshield} />
        <View style={styles.playerRearWindow} />
      </Animated.View>

      <Animated.View style={[styles.hitFlashOverlay, flashStyle]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  road: {
    backgroundColor: "#1D1F27",
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#2E3240",
  },
  curbStripe: {
    position: "absolute",
    width: 8,
  },
  curbLeft: {
    left: 0,
  },
  curbRight: {
    right: 0,
  },
  laneDash: {
    position: "absolute",
    width: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.36)",
  },
  speedStreak: {
    position: "absolute",
    width: 2,
    height: 36,
    borderRadius: 1,
    backgroundColor: "#E2E8F0",
  },
  speedStreakLeft: {
    left: 16,
  },
  speedStreakRight: {
    right: 16,
  },
  carBody: {
    position: "absolute",
    top: 0,
    left: 0,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  playerCar: {
    backgroundColor: theme.colors.accent,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  racingStripe: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  headlights: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  headlight: {
    width: 5,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FEF08A",
  },
  playerWindshield: {
    width: "76%",
    height: "24%",
    borderRadius: 4,
    backgroundColor: "#0F172A",
    marginTop: 2,
  },
  playerRearWindow: {
    width: "68%",
    height: "15%",
    borderRadius: 3,
    backgroundColor: "#1E293B",
  },
  rivalWindshield: {
    width: "74%",
    height: "18%",
    borderRadius: 3,
    backgroundColor: "#0F172A",
    marginTop: 2,
  },
  rivalRearWindow: {
    width: "68%",
    height: "14%",
    borderRadius: 3,
    backgroundColor: "#1E293B",
  },
  busRoofVent: {
    width: "52%",
    height: "24%",
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  motoHelmet: {
    position: "absolute",
    top: "34%",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#0F172A",
  },
  rivalTaillights: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  taillight: {
    width: 5,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#EF4444",
  },
  hitFlashOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#EF4444",
  },
});
