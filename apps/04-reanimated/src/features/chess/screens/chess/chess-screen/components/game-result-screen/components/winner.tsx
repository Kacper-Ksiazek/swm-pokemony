import { useEffect } from "react";
import { Image } from "expo-image";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { CHESS_PIECE_IMAGES } from "@/features/chess/assets/chess-assets";

import type { GameOutcome } from "../../../../utils/chess-engine";

import { winnerStyles as styles } from "./winner.styles";

/** The winning king in a breathing neon ring; a draw shows both kings. */
export function Winner({ outcome, color }: { outcome: GameOutcome; color: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.set(
      withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.45 + 0.5 * pulse.get(),
    shadowRadius: 18 + 26 * pulse.get(),
    transform: [{ scale: 1 + 0.035 * pulse.get() }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        { borderColor: color, shadowColor: color, backgroundColor: "rgba(255, 255, 255, 0.04)" },
        glowStyle,
      ]}
    >
      {outcome === "draw" ? (
        <View style={styles.drawKings}>
          <Image
            source={CHESS_PIECE_IMAGES.white.king}
            style={styles.drawKing}
            contentFit="contain"
          />
          <Image
            source={CHESS_PIECE_IMAGES.black.king}
            style={styles.drawKing}
            contentFit="contain"
          />
        </View>
      ) : (
        <Image source={CHESS_PIECE_IMAGES[outcome].king} style={styles.king} contentFit="contain" />
      )}
    </Animated.View>
  );
}
