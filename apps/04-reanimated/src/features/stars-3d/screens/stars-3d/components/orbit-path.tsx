import { Path } from "react-native-svg";
import Animated, { type SharedValue, useAnimatedProps } from "react-native-reanimated";

import { buildOrbitPath, type SceneViewport } from "../projection";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type WorldPoint = {
  x: number;
  z: number;
};

type OrbitPathProps = {
  radius: number;
  color: `#${string}`;
  parentIndex: number;
  worldPositions: SharedValue<WorldPoint[]>;
  cameraCenter: SharedValue<WorldPoint>;
  cameraDistance: SharedValue<number>;
  yaw: SharedValue<number>;
  pitch: SharedValue<number>;
  viewport: SharedValue<SceneViewport>;
  screenOffsetY: SharedValue<number>;
};

export function OrbitPath({
  radius,
  color,
  parentIndex,
  worldPositions,
  cameraCenter,
  cameraDistance,
  yaw,
  pitch,
  viewport,
  screenOffsetY,
}: OrbitPathProps) {
  const animatedProps = useAnimatedProps(() => {
    const center = cameraCenter.get();
    const origin = parentIndex >= 0 ? worldPositions.get()[parentIndex] : undefined;
    const originX = origin ? origin.x : 0;
    const originZ = origin ? origin.z : 0;
    const { width, height } = viewport.get();

    return {
      d: buildOrbitPath({
        orbitRadius: radius,
        origin: { x: originX, z: originZ },
        center: { x: center.x, z: center.z },
        camera: {
          distance: cameraDistance.get(),
          yaw: yaw.get(),
          pitch: pitch.get(),
        },
        viewport: { width, height },
        screenOffsetY: screenOffsetY.get(),
      }),
    };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      fill="none"
      stroke={color}
      strokeOpacity={0.35}
      strokeWidth={1}
      strokeDasharray="4 6"
    />
  );
}
