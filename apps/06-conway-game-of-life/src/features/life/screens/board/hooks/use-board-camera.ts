import { useRef } from "react";
import {
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
} from "react-native-gesture-handler";

import { createBoardCamera, panBy, zoomAt, type BoardCamera, type Viewport } from "./board-camera";

const EMPTY_VIEWPORT: Viewport = {
  pointsWidth: 0,
  pointsHeight: 0,
  pixelsWidth: 0,
  pixelsHeight: 0,
};

/**
 * Pinch zooms the field toward the fingers. One-finger drag pans.
 * The canvas loop reads the same refs, so a gesture does not rebuild the GPU state.
 */
export function useBoardCamera() {
  const cameraRef = useRef<BoardCamera>(createBoardCamera());
  const viewportRef = useRef<Viewport>(EMPTY_VIEWPORT);

  const pan = usePanGesture({
    runOnJS: true,
    maxPointers: 1,
    onUpdate: (event) => {
      panBy(cameraRef.current, viewportRef.current, event.changeX, event.changeY);
    },
  });
  const pinch = usePinchGesture({
    runOnJS: true,
    onUpdate: (event) => {
      zoomAt(cameraRef.current, event.scaleChange, event.focalX, event.focalY, viewportRef.current);
    },
  });

  return {
    gesture: useSimultaneousGestures(pan, pinch),
    cameraRef,
    viewportRef,
  };
}
