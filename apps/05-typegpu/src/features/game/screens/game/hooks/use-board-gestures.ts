import {
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
} from "react-native-gesture-handler";

import type { BoardScene } from "../scene/create-board-scene";

/**
 * Map preview gestures on the board canvas:
 * - one finger drag orbits the camera (left/right turns, up/down tilts),
 * - pinch zooms,
 * - two-finger twist turns the board.
 *
 * The scene is plain JS (three.js), so callbacks run on the JS thread (`runOnJS`) and pass the
 * per-event change straight to the camera rig, which eases toward it.
 */
export function useBoardGestures(scene: BoardScene | null) {
  const pan = usePanGesture({
    runOnJS: true,
    maxPointers: 1,
    onUpdate: (event) => scene?.orbit(event.changeX, event.changeY),
  });
  const pinch = usePinchGesture({
    runOnJS: true,
    onUpdate: (event) => scene?.zoom(event.scaleChange),
  });
  const rotation = useRotationGesture({
    runOnJS: true,
    onUpdate: (event) => scene?.rotate(event.rotationChange),
  });

  return useSimultaneousGestures(pan, pinch, rotation);
}
