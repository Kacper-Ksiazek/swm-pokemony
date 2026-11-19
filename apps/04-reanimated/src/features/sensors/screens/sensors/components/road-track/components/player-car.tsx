import { View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { PLAYER_Y_NORM } from "../../../constants";
import { styles } from "../road-track.styles";
import type { PlayerCarProps } from "../road-track.types";

export function PlayerCar({
  width,
  height,
  playerW,
  playerH,
  playerX,
  playerLeanDeg,
  invulnerableSec,
}: PlayerCarProps) {
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

  return (
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
  );
}
