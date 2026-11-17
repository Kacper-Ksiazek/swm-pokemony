import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg from "react-native-svg";

import { SOLAR_SYSTEM_BODIES } from "../../solar-system";
import { OrbitPath } from "../orbit-path";
import { OrbitPlaneIndicator } from "../orbit-plane-indicator";
import { Planet } from "../planet";
import { ZoomIndicator } from "../zoom-indicator";
import { useSceneGestures } from "./hooks/use-scene-gestures";
import { useSolarSystemSimulation } from "./hooks/use-solar-system-simulation";
import { BODY_PARENT_INDICES } from "./solar-system-scene.constants";
import type { SolarSystemSceneProps } from "./solar-system-scene.types";

/** Interactive 3D solar system view driven by Reanimated frame updates and gestures. */
export function SolarSystemScene({
  focusRequest,
  drawerHeight,
  isActive = true,
  onSelectBody,
}: SolarSystemSceneProps) {
  const insets = useSafeAreaInsets();

  const {
    cameraDistance,
    yaw,
    pitch,
    viewport,
    spinAngles,
    worldPositions,
    projections,
    cameraCenter,
    screenOffsetY,
    focusBodyOnUI,
    setViewport,
    resetOrientation,
    resetZoom,
  } = useSolarSystemSimulation({ focusRequest, drawerHeight, isActive });

  const gesture = useSceneGestures({
    cameraDistance,
    yaw,
    pitch,
    viewport,
    projections,
    focusBodyOnUI,
    onSelectBody,
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport(width, height);
  };

  return (
    <View style={styles.card} onLayout={handleLayout}>
      <GestureDetector gesture={gesture}>
        <View style={styles.sky}>
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
            {SOLAR_SYSTEM_BODIES.map((body, index) =>
              body.radius > 0 ? (
                <OrbitPath
                  key={`orbit-${body.id}`}
                  radius={body.radius}
                  color={body.color}
                  parentIndex={BODY_PARENT_INDICES[index]}
                  worldPositions={worldPositions}
                  cameraCenter={cameraCenter}
                  cameraDistance={cameraDistance}
                  yaw={yaw}
                  pitch={pitch}
                  viewport={viewport}
                  screenOffsetY={screenOffsetY}
                />
              ) : null,
            )}
          </Svg>

          {SOLAR_SYSTEM_BODIES.map((body, index) => (
            <Planet
              key={body.id}
              id={body.id}
              index={index}
              size={body.displaySize}
              color={body.color}
              projections={projections}
              spinAngles={spinAngles}
              pitch={pitch}
              includeOverlay={body.includeOverlay}
              hasRing={body.hasRing}
            />
          ))}
        </View>
      </GestureDetector>

      <View style={[styles.indicators, { top: insets.top + 8 }]} pointerEvents="box-none">
        <ZoomIndicator distance={cameraDistance} onReset={resetZoom} />
        <OrbitPlaneIndicator yaw={yaw} pitch={pitch} onReset={resetOrientation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#232323",
  },
  sky: {
    flex: 1,
  },
  indicators: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    zIndex: 100000,
  },
});
