import {
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
} from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type MapGesturesInput = {
  box: { w: number; h: number };
  width: number;
  mapHeight: number;
};

/** Keeps the zoomed map covering the viewport: max offset is half of the extra size. */
function clampOffset(
  v: number,
  mapSize: number,
  areaSize: number,
  zoom: { get: () => number },
): number {
  "worklet";

  const max = Math.max(0, (zoom.get() * mapSize - areaSize) / 2);
  return Math.min(max, Math.max(-max, v));
}

export function useSkiaMapGestures({ box, width, mapHeight }: MapGesturesInput) {
  const zoom = useSharedValue(1);
  const startZoom = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pinch = usePinchGesture({
    onBegin: () => startZoom.set(zoom.get()),
    onUpdate: (e) => {
      zoom.set(Math.min(5, Math.max(1, startZoom.get() * e.scale)));
      x.set(clampOffset(x.get(), width, box.w, zoom));
      y.set(clampOffset(y.get(), mapHeight, box.h, zoom));
    },
  });
  const pan = usePanGesture({
    onBegin: () => {
      startX.set(x.get());
      startY.set(y.get());
    },
    onUpdate: (e) => {
      x.set(clampOffset(startX.get() + e.translationX, width, box.w, zoom));
      y.set(clampOffset(startY.get() + e.translationY, mapHeight, box.h, zoom));
    },
  });
  const gesture = useSimultaneousGestures(pinch, pan);
  const mapStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: zoom.get() }],
  }));

  function resetTransform() {
    zoom.set(1);
    x.set(0);
    y.set(0);
  }

  return { gesture, mapStyle, resetTransform };
}
