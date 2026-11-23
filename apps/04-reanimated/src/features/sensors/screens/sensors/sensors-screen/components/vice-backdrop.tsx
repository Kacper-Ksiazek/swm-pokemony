import { useEffect } from "react";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { MAX_SPEED_KMH, MIN_SPEED_KMH, VICE_COLORS } from "../../constants";

const VICE_BACKDROP = require("../../../../assets/vice-backdrop.jpg");

type ViceBackdropProps = {
  playerX: SharedValue<number>;
  liveSpeedKmh: SharedValue<number>;
};

/** Fullscreen Miami synthwave backdrop behind the road with subtle steering parallax and neon pulse. */
export function ViceBackdrop({ playerX, liveSpeedKmh }: ViceBackdropProps) {
  const glowPulse = useSharedValue(0.18);

  useEffect(() => {
    glowPulse.set(
      withRepeat(
        withSequence(
          withTiming(0.32, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.14, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, [glowPulse]);

  const parallaxStyle = useAnimatedStyle(() => {
    const shiftX = (0.5 - playerX.get()) * 22;
    const speedRatio = Math.max(
      0,
      Math.min(1, (liveSpeedKmh.get() - MIN_SPEED_KMH) / (MAX_SPEED_KMH - MIN_SPEED_KMH)),
    );
    return {
      transform: [{ translateX: shiftX }, { scale: 1.06 + speedRatio * 0.04 }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.get(),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.imageWrap, parallaxStyle]}>
        <Image source={VICE_BACKDROP} style={styles.image} contentFit="cover" transition={0} />
      </Animated.View>

      <Animated.View style={[styles.neonWash, pulseStyle]} />
      <View style={styles.vignette} />
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  neonWash: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: VICE_COLORS.pink,
  },
  vignette: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(9, 5, 20, 0.36)",
  },
});
