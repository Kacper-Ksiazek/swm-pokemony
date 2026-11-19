import { Image, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle } from "react-native-reanimated";

import { MAX_SPEED_KMH, MIN_SPEED_KMH, PLAYER_Y_NORM, VICE_COLORS } from "../../../constants";
import { styles } from "../road-track.styles";
import type { PlayerCarProps } from "../road-track.types";

const PLAYER_CAR_SPRITE = require("../../../../../assets/player-car.png");

export function PlayerCar({
  width,
  height,
  playerW,
  playerH,
  playerX,
  playerLeanDeg,
  invulnerableSec,
  liveSpeedKmh,
}: PlayerCarProps) {
  const playerStyle = useAnimatedStyle(() => {
    const invuln = invulnerableSec.get();
    const blink = invuln > 0 && Math.floor(invuln * 10) % 2 === 0 ? 0.35 : 1;

    return {
      opacity: blink,
      transform: [
        { translateX: playerX.get() * width - playerW / 2 },
        { translateY: PLAYER_Y_NORM * height - playerH / 2 },
        { rotate: `${playerLeanDeg.get()}deg` },
      ],
    };
  });

  const underglowStyle = useAnimatedStyle(() => {
    const ratio = Math.max(
      0,
      Math.min(1, (liveSpeedKmh.get() - MIN_SPEED_KMH) / (MAX_SPEED_KMH - MIN_SPEED_KMH)),
    );
    return {
      opacity: 0.35 + ratio * 0.55,
      transform: [{ scale: 0.96 + ratio * 0.12 }],
      backgroundColor: interpolateColor(
        ratio,
        [0, 0.6, 1],
        ["rgba(0, 240, 255, 0.20)", "rgba(255, 214, 0, 0.25)", "rgba(255, 46, 147, 0.38)"],
      ),
    };
  });

  const nitroFlameStyle = useAnimatedStyle(() => {
    const speed = liveSpeedKmh.get();
    const ratio = Math.max(0, Math.min(1, (speed - 115) / (MAX_SPEED_KMH - 115)));
    const flicker = 0.85 + Math.abs(Math.sin(speed * 0.9)) * 0.35;
    return {
      opacity: ratio * 0.95,
      transform: [{ scaleY: (0.4 + ratio * 0.9) * flicker }],
      backgroundColor: ratio > 0.7 ? VICE_COLORS.pink : VICE_COLORS.cyan,
    };
  });

  return (
    <Animated.View
      style={[
        styles.spriteContainer,
        {
          width: playerW,
          height: playerH,
        },
        playerStyle,
      ]}
    >
      <Animated.View style={[styles.playerUnderglow, underglowStyle]} pointerEvents="none" />

      <View style={styles.nitroFlamesRow} pointerEvents="none">
        <Animated.View style={[styles.nitroFlame, nitroFlameStyle]} />
        <Animated.View style={[styles.nitroFlame, nitroFlameStyle]} />
      </View>

      <Image
        source={PLAYER_CAR_SPRITE}
        style={{ width: playerW, height: playerH, zIndex: 2 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
