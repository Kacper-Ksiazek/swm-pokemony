import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface PlanetProps {
  id: string;
  size: number;
  color: `#${string}`;
  velocity: number;
  angularVelocity: number;
  radius: number;
  includeOverlay?: boolean;
  isActive?: boolean;
}

const FULL_ROTATION = 2 * Math.PI;

function rotationDurationMs(angularSpeedRadPerSec: number): number {
  return (FULL_ROTATION / Math.abs(angularSpeedRadPerSec)) * 1000;
}

export function Planet({
  id,
  size,
  color,
  velocity,
  angularVelocity,
  radius,
  includeOverlay = true,
  isActive = true,
}: PlanetProps) {
  const orbitAngle = useSharedValue(0);
  const spinAngle = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      cancelAnimation(orbitAngle);
      cancelAnimation(spinAngle);

      return;
    }

    orbitAngle.set(0);

    if (radius > 0 && velocity > 0) {
      orbitAngle.set(
        withRepeat(
          withTiming(FULL_ROTATION, {
            duration: rotationDurationMs(velocity),
            easing: Easing.linear,
          }),
          -1,
          false,
        ),
      );
    }

    spinAngle.set(0);

    if (angularVelocity !== 0) {
      const signedRotation = angularVelocity > 0 ? FULL_ROTATION : -FULL_ROTATION;
      spinAngle.set(
        withRepeat(
          withTiming(signedRotation, {
            duration: rotationDurationMs(angularVelocity),
            easing: Easing.linear,
          }),
          -1,
          false,
        ),
      );
    }

    return () => {
      cancelAnimation(orbitAngle);
      cancelAnimation(spinAngle);
    };
  }, [angularVelocity, isActive, orbitAngle, radius, spinAngle, velocity]);

  const planetStyle = useAnimatedStyle(() => {
    const half = size / 2;
    const orbitTransforms =
      radius > 0 ? ([{ rotate: `${orbitAngle.get()}rad` }, { translateX: radius }] as const) : [];

    return {
      transform: [
        { translateX: -half },
        { translateY: -half },
        ...orbitTransforms,
        { rotate: `${spinAngle.get()}rad` },
      ],
    };
  });

  return (
    <Animated.View
      id={id}
      style={[
        styles.planet,
        {
          width: size,
          height: size,
          backgroundColor: color,
        },
        planetStyle,
      ]}
    >
      {includeOverlay && <View style={styles.overlay} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  planet: {
    overflow: "hidden",
    borderRadius: "50%",
    position: "absolute",
    top: "50%",
    left: "50%",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    backgroundColor: "#000",
    opacity: 0.3,
  },
});
