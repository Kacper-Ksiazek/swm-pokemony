import { StyleSheet, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { type ProjectedBody } from "../projection";

type PlanetProps = {
  id: string;
  index: number;
  size: number;
  color: `#${string}`;
  projections: SharedValue<ProjectedBody[]>;
  spinAngles: SharedValue<number[]>;
  pitch: SharedValue<number>;
  includeOverlay?: boolean;
  hasRing?: boolean;
};

const RING_OUTER_MULTIPLIER = 2.3;
const RING_INNER_MULTIPLIER = 1.65;

export function Planet({
  id,
  index,
  size,
  color,
  projections,
  spinAngles,
  pitch,
  includeOverlay = true,
  hasRing = false,
}: PlanetProps) {
  const containerStyle = useAnimatedStyle(() => {
    const point = projections.get()[index];

    if (!point || point.depth <= 0) {
      return {
        opacity: 0,
        zIndex: 0,
      };
    }

    const half = size / 2;

    return {
      opacity: 1,
      zIndex: Math.round(1000000 / point.depth),
      transform: [
        { translateX: point.x - half },
        { translateY: point.y - half },
        { scale: point.scale },
      ],
    };
  });

  const spinStyle = useAnimatedStyle(() => {
    const spin = spinAngles.get()[index] ?? 0;

    return {
      transform: [{ rotate: `${spin}rad` }],
    };
  });

  const ringStyle = useAnimatedStyle(() => {
    const tilt = Math.max(0.14, Math.abs(Math.sin(pitch.get())));

    return {
      transform: [{ rotate: "-12deg" }, { scaleY: tilt }],
    };
  });

  const outerRingSize = Math.round(size * RING_OUTER_MULTIPLIER);
  const innerRingSize = Math.round(size * RING_INNER_MULTIPLIER);
  const ringOffset = (size - outerRingSize) / 2;
  const innerOffset = (outerRingSize - innerRingSize) / 2;
  const halfRing = outerRingSize / 2;

  const renderRings = (isFront: boolean) => (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ringPlane,
        {
          width: outerRingSize,
          height: outerRingSize,
          top: ringOffset,
          left: ringOffset,
        },
        ringStyle,
      ]}
    >
      <View
        style={[
          styles.ringClip,
          {
            width: outerRingSize,
            height: halfRing,
            top: isFront ? halfRing : 0,
          },
        ]}
      >
        <View
          style={[
            styles.ringOuter,
            {
              width: outerRingSize,
              height: outerRingSize,
              borderRadius: halfRing,
              top: isFront ? -halfRing : 0,
            },
          ]}
        >
          <View
            style={[
              styles.ringInner,
              {
                width: innerRingSize,
                height: innerRingSize,
                borderRadius: innerRingSize / 2,
                top: innerOffset - 2,
                left: innerOffset - 2,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <Animated.View
      id={id}
      pointerEvents="none"
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
        containerStyle,
      ]}
    >
      {hasRing && renderRings(false)}
      <Animated.View
        style={[
          styles.planet,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          spinStyle,
        ]}
      >
        {includeOverlay && <View style={styles.overlay} />}
      </Animated.View>
      {hasRing && renderRings(true)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  planet: {
    overflow: "hidden",
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
  ringPlane: {
    position: "absolute",
  },
  ringClip: {
    position: "absolute",
    left: 0,
    overflow: "hidden",
  },
  ringOuter: {
    position: "absolute",
    left: 0,
    borderWidth: 2,
    borderColor: "rgba(232, 213, 163, 0.78)",
  },
  ringInner: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(197, 175, 124, 0.55)",
  },
});
