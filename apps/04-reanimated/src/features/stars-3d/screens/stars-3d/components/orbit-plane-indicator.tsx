import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

const DISK = 44;

type OrbitPlaneIndicatorProps = {
  yaw: SharedValue<number>;
  pitch: SharedValue<number>;
  onReset: () => void;
};

export function OrbitPlaneIndicator({ yaw, pitch, onReset }: OrbitPlaneIndicatorProps) {
  const squashStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: Math.max(0.08, Math.sin(pitch.get())) }],
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-yaw.get()}rad` }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.frame}>
        <View style={styles.guide} />
        <Animated.View style={[styles.disk, squashStyle]}>
          <Animated.View style={[styles.spin, spinStyle]}>
            <View style={styles.near} />
          </Animated.View>
        </Animated.View>
        <View style={styles.axis} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Resetuj obrót"
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
  disk: {
    width: DISK,
    height: DISK,
    alignItems: "center",
    justifyContent: "center",
  },
  spin: {
    width: DISK,
    height: DISK,
    borderRadius: DISK / 2,
    borderWidth: 2,
    borderColor: "#FFD700",
    alignItems: "center",
  },
  near: {
    position: "absolute",
    bottom: -4,
    left: DISK / 2 - 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
  },
  axis: {
    position: "absolute",
    width: 1,
    height: DISK + 8,
    top: (64 - (DISK + 8)) / 2,
    left: 32,
    backgroundColor: "rgba(255,255,255,0.85)",
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
