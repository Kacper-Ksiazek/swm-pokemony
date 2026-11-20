import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DemoScreen } from "@/components/demo-screen";

import { MapOverlayButtons } from "./components/map-overlay-buttons";
import { RouteHud } from "./components/route-hud";
import { SkiaMapView } from "./components/skia-map-view";
import { useSkiaMapGestures } from "./hooks/use-skia-map-gestures";
import { useSkiaMapLayout } from "./hooks/use-skia-map-layout";
import { useSkiaMapOrientation } from "./hooks/use-skia-map-orientation";
import { useSkiaRouteProgress } from "./hooks/use-skia-route-progress";

export function SkiaScreen() {
  const insets = useSafeAreaInsets();
  const { box, landscape, scale, width, mapHeight, onAreaLayout } = useSkiaMapLayout();
  const { gesture, mapStyle, resetTransform } = useSkiaMapGestures({ box, width, mapHeight });
  const { toggleOrientation } = useSkiaMapOrientation({ landscape, resetTransform });
  const { progress, routeProgressFillStyle, onProgressTrackLayout } = useSkiaRouteProgress();

  return (
    <DemoScreen scroll={false} fullWidth immersive>
      <View style={styles.area} onLayout={onAreaLayout}>
        <SkiaMapView
          gesture={gesture}
          mapStyle={mapStyle}
          width={width}
          mapHeight={mapHeight}
          fitScale={scale}
          progress={progress}
        />

        <MapOverlayButtons landscape={landscape} onToggleOrientation={toggleOrientation} />

        <RouteHud
          insets={insets}
          routeProgressFillStyle={routeProgressFillStyle}
          onProgressTrackLayout={onProgressTrackLayout}
        />
      </View>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
});
