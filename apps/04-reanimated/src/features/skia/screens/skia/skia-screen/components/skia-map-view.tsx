import { Image, StyleSheet, View } from "react-native";
import { Canvas, Circle, Group, Path } from "@shopify/react-native-skia";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { type SharedValue } from "react-native-reanimated";

import type { useSkiaMapGestures } from "../hooks/use-skia-map-gestures";

import { theme } from "@/components/theme";

import { ROUTE } from "../constants/skia-map.constants";

type SkiaMapViewProps = {
  gesture: ReturnType<typeof useSkiaMapGestures>["gesture"];
  mapStyle: ReturnType<typeof useSkiaMapGestures>["mapStyle"];
  width: number;
  mapHeight: number;
  fitScale: number;
  progress: SharedValue<number>;
};

export function SkiaMapView({
  gesture,
  mapStyle,
  width,
  mapHeight,
  fitScale,
  progress,
}: SkiaMapViewProps) {
  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.pane}>
        <Animated.View style={[{ width, height: mapHeight }, mapStyle]}>
          <Image
            source={require("@/assets/images/krakow-wadowice-map.webp")}
            style={{ width, height: mapHeight }}
            resizeMode="stretch"
          />
          <Canvas style={StyleSheet.absoluteFill}>
            <Group transform={[{ scale: fitScale }]}>
              <Path
                path={ROUTE}
                style="stroke"
                strokeWidth={6}
                strokeCap="round"
                strokeJoin="round"
                color="#9CA3AF"
              />
              <Path
                path={ROUTE}
                style="stroke"
                strokeWidth={14}
                strokeCap="round"
                strokeJoin="round"
                color={theme.colors.accent}
                start={0}
                end={progress}
              />
              <Circle cx={1790} cy={452} r={16} color={theme.colors.accent} />
              <Circle cx={249} cy={1269} r={16} color={theme.colors.accentStrong} />
            </Group>
          </Canvas>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  pane: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
