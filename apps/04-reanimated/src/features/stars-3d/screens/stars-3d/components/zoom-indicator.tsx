import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { BASE_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE, MIN_CAMERA_DISTANCE } from "../projection";

const DISK = 44;
const RING = 16;

type ZoomIndicatorProps = {
  distance: SharedValue<number>;
  onReset: () => void;
};

export function ZoomIndicator({ distance, onReset }: ZoomIndicatorProps) {
  const ringStyle = useAnimatedStyle(() => {
    const zoom = BASE_CAMERA_DISTANCE / Math.max(distance.get(), 1);
    const closest = BASE_CAMERA_DISTANCE / MIN_CAMERA_DISTANCE;
    const farthest = BASE_CAMERA_DISTANCE / MAX_CAMERA_DISTANCE;
    const t = (Math.log(zoom) - Math.log(farthest)) / (Math.log(closest) - Math.log(farthest));

    return {
      transform: [{ scale: 0.45 + Math.min(1, Math.max(0, t)) * (DISK / RING - 0.45) }],
    };
  });

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.frame}>
        <View style={styles.guide} />
        <Animated.View style={[styles.ring, ringStyle]} />
        <View style={styles.sun} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Resetuj zbliżenie"
        hitSlop={8}
        onPress={onReset}
        style={styles.resetButton}
      >
        <Text style={styles.resetLabel}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 6,
  },
  frame: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  guide: {
    position: "absolute",
    width: DISK,
    height: DISK,
    left: (64 - DISK) / 2,
    top: (64 - DISK) / 2,
    borderRadius: DISK / 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  sun: {
    position: "absolute",
    width: 6,
    height: 6,
    left: 64 / 2 - 3,
    top: 64 / 2 - 3,
    borderRadius: 3,
    backgroundColor: "#FFD700",
  },
  resetButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  resetLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: "#FFFFFF",
  },
});
