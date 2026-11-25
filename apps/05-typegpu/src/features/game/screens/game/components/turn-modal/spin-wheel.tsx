import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { SPIN_MAX, SPIN_MIN } from "../../../../store/game-rules";

export const SPIN_DURATION_MS = 2600;

const SIZE = 250;
const SEGMENTS = SPIN_MAX - SPIN_MIN + 1;
const SEGMENT_ANGLE = 360 / SEGMENTS;
const FULL_TURNS = 5;
const LABEL_RADIUS = SIZE / 2 - 30;

/** Rainbow color for a wheel segment, matching the 3D spinner. */
function segmentColor(index: number) {
  return `hsl(${Math.round((index / SEGMENTS) * 360)}, 78%, 56%)`;
}

type SpinWheelProps = {
  /** Number the wheel stops on (under the pointer at the top). */
  result: number;
};

/** The spinner wheel in the turn modal: spins a few turns and eases out on `result`. */
export function SpinWheel({ result }: SpinWheelProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Number n sits (n − 1) segments clockwise from the top; turn back by that much.
    const target = FULL_TURNS * 360 - (result - SPIN_MIN) * SEGMENT_ANGLE;

    rotation.set(0);
    rotation.set(
      withTiming(target, { duration: SPIN_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );
  }, [result, rotation]);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));

  return (
    <View style={styles.root}>
      <View style={styles.pointer} />
      <Animated.View style={[styles.wheel, wheelStyle]}>
        {Array.from({ length: SEGMENTS }, (_, index) => {
          const angle = (index * SEGMENT_ANGLE * Math.PI) / 180;

          return (
            <View
              key={index}
              style={[
                styles.label,
                {
                  backgroundColor: segmentColor(index),
                  transform: [
                    { translateX: Math.sin(angle) * LABEL_RADIUS },
                    { translateY: -Math.cos(angle) * LABEL_RADIUS },
                    { rotate: `${index * SEGMENT_ANGLE}deg` },
                  ],
                },
              ]}
            >
              <Text style={styles.labelText}>{SPIN_MIN + index}</Text>
            </View>
          );
        })}
        <View style={styles.hub} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    width: SIZE,
    height: SIZE + 14,
  },
  pointer: {
    zIndex: 1,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 22,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#111827",
    marginBottom: -8,
  },
  wheel: {
    alignItems: "center",
    justifyContent: "center",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 6,
    borderColor: "#FFFFFF",
    backgroundColor: "#F3F4F6",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  label: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  labelText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  hub: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#111827",
  },
});
