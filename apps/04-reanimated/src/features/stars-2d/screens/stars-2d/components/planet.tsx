import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

interface PlanetProps {
  id: string;
  size: number;
  color: `#${string}`;
  velocity: number;
  angularVelocity: number;
  radius: number;
  includeOverlay?: boolean;
}

export function Planet({
  id,
  size,
  color,
  velocity,
  angularVelocity,
  radius,
  includeOverlay = true,
}: PlanetProps) {
  const orbitAngle = useSharedValue(0);
  const spinAngle = useSharedValue(0);
  const position = useSharedValue<{ x: number; y: number }>({
    x: radius,
    y: 0,
  });

  useFrameCallback(
    useCallback(
      (frameInfo) => {
        "worklet";
        const dt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;

        if (radius > 0) {
          orbitAngle.set(orbitAngle.get() + velocity * dt);

          const angle = orbitAngle.get();

          position.set({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
          });
        }

        if (angularVelocity !== 0) {
          spinAngle.set(spinAngle.get() + angularVelocity * dt);
        }
      },
      [angularVelocity, orbitAngle, position, radius, spinAngle, velocity],
    ),
  );

  const planetStyle = useAnimatedStyle(() => {
    const { x, y } = position.get();
    const half = size / 2;

    return {
      transform: [
        { translateX: x - half },
        { translateY: y - half },
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
