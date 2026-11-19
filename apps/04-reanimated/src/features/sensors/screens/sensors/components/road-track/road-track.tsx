import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import {
  LANE_COUNT,
  PLAYER_CAR_HEIGHT_NORM,
  PLAYER_CAR_WIDTH_NORM,
  TRAFFIC_POOL_SIZE,
} from "../../constants";
import { CurbStripe } from "./components/curb-stripe";
import { LaneDash } from "./components/lane-dash";
import { PlayerCar } from "./components/player-car";
import { SpeedStreak } from "./components/speed-streak";
import { TrafficVehicleSprite } from "./components/traffic-vehicle-sprite";
import { CURB_STRIPE_COUNT, DASH_COUNT, SPEED_STREAK_COUNT } from "./road-track.constants";
import { styles } from "./road-track.styles";
import type { RoadTrackProps } from "./road-track.types";

/** Scrolling road canvas: curbs, lane dashes, traffic pool, player car, and hit flash. */
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

  const flashStyle = useAnimatedStyle(() => ({
    opacity: hitFlash.get() * 0.45,
  }));

  const roadShakeStyle = useAnimatedStyle(() => {
    const flash = hitFlash.get();
    if (flash <= 0.01) {
      return { transform: [{ translateX: 0 }, { translateY: 0 }] };
    }
    const shakeX = Math.sin(flash * 42) * flash * 8;
    const shakeY = Math.cos(flash * 34) * flash * 5;
    return {
      transform: [{ translateX: shakeX }, { translateY: shakeY }],
    };
  });

  return (
    <Animated.View style={[styles.road, { width, height }, roadShakeStyle]}>
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

      {Array.from({ length: SPEED_STREAK_COUNT }).map((_, i) => (
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

      <PlayerCar
        width={width}
        height={height}
        playerW={playerW}
        playerH={playerH}
        playerX={playerX}
        playerLeanDeg={playerLeanDeg}
        invulnerableSec={invulnerableSec}
        liveSpeedKmh={liveSpeedKmh}
      />

      <Animated.View style={[styles.hitFlashOverlay, flashStyle]} pointerEvents="none" />
    </Animated.View>
  );
}
