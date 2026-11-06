import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ViewInstance } from "react-native";
import { type SharedValue, useSharedValue } from "react-native-reanimated";
import {
  type CameraRef,
  isScannedFace,
  type ScannedObject,
  type ScannedObjectType,
  useObjectOutput,
} from "react-native-vision-camera";

import type { FaceScanDebug } from "../devtools";
import { stickerFrameFromFaces } from "../sticker-frame";
import type { HeadStickerFrame, PreviewLayout } from "../sticker-frame.types";

const FACE_OUTPUT_TYPES: ScannedObjectType[] = ["face"];

type UseHeadStickerParams = {
  cameraRef: RefObject<CameraRef | null>;
  previewRef: RefObject<ViewInstance | null>;
  isFocused: boolean;
};

type UseHeadStickerResult = {
  frame: SharedValue<HeadStickerFrame | null>;
  previewWidth: SharedValue<number>;
  previewHeight: SharedValue<number>;
  scannerOutput: ReturnType<typeof useObjectOutput>;
  measurePreview: () => void;
  debug: FaceScanDebug;
};

export function useHeadSticker({
  cameraRef,
  previewRef,
  isFocused,
}: UseHeadStickerParams): UseHeadStickerResult {
  const frame = useSharedValue<HeadStickerFrame | null>(null);
  const previewWidth = useSharedValue(0);
  const previewHeight = useSharedValue(0);
  const layoutRef = useRef<PreviewLayout>({ x: 0, y: 0, width: 0, height: 0 });
  const [debug, setDebug] = useState<FaceScanDebug>({
    scans: 0,
    faces: 0,
    placed: false,
    error: null,
  });
  const debugRef = useRef(debug);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLoggedFaces = useRef<number | null>(null);

  function handleObjectsScanned(objects: ScannedObject[]) {
    const camera = cameraRef.current;
    if (camera == null) {
      return;
    }

    const faces: { bounds: { x: number; y: number; width: number; height: number } }[] = [];

    for (const object of objects) {
      if (!isScannedFace(object)) {
        continue;
      }

      try {
        const viewFace = camera.convertScannedObjectCoordinatesToViewCoordinates(object);
        const box = viewFace.boundingBox;
        faces.push({
          bounds: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
          },
        });
      } catch (error) {
        frame.set(null);
        const message = error instanceof Error ? error.message : "Face scan failed";
        if (debugRef.current.error !== message) {
          flushDebugState({
            next: {
              scans: debugRef.current.scans,
              faces: 0,
              placed: false,
              error: message,
            },
            immediate: true,
            debugRef,
            flushTimer,
            setDebug,
          });
        }
        return;
      }
    }

    const placed = stickerFrameFromFaces(faces, {
      x: 0,
      y: 0,
      width: layoutRef.current.width,
      height: layoutRef.current.height,
    });
    frame.set(placed);

    if (__DEV__ && lastLoggedFaces.current !== faces.length) {
      lastLoggedFaces.current = faces.length;
      console.log(`[camera] faces: ${faces.length}`);
    }

    flushDebugState({
      next: {
        scans: debugRef.current.scans + 1,
        faces: faces.length,
        placed: placed != null,
        error: null,
      },
      debugRef,
      flushTimer,
      setDebug,
    });
  }

  const scannerOutput = useObjectOutput({
    types: FACE_OUTPUT_TYPES,
    onObjectsScanned: handleObjectsScanned,
  });

  function measurePreview() {
    measurePreviewLayout({ previewRef, layoutRef, previewWidth, previewHeight });
  }

  useEffect(() => {
    if (!isFocused) {
      frame.set(null);
      flushDebugState({
        next: { scans: 0, faces: 0, placed: false, error: null },
        immediate: true,
        debugRef,
        flushTimer,
        setDebug,
      });
      return;
    }

    measurePreviewLayout({ previewRef, layoutRef, previewWidth, previewHeight });
  }, [frame, isFocused, previewHeight, previewRef, previewWidth]);

  useEffect(() => {
    return () => {
      if (flushTimer.current != null) {
        clearTimeout(flushTimer.current);
      }
    };
  }, []);

  return { frame, previewWidth, previewHeight, scannerOutput, measurePreview, debug };
}

type FlushDebugArgs = {
  next: FaceScanDebug;
  immediate?: boolean;
  debugRef: RefObject<FaceScanDebug>;
  flushTimer: RefObject<ReturnType<typeof setTimeout> | null>;
  setDebug: Dispatch<SetStateAction<FaceScanDebug>>;
};

function flushDebugState({
  next,
  immediate = false,
  debugRef,
  flushTimer,
  setDebug,
}: FlushDebugArgs) {
  debugRef.current = next;

  if (!__DEV__) {
    return;
  }

  if (immediate) {
    if (flushTimer.current != null) {
      clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    setDebug(next);
    return;
  }

  if (flushTimer.current != null) {
    return;
  }

  flushTimer.current = setTimeout(() => {
    flushTimer.current = null;
    setDebug(debugRef.current);
  }, 250);
}

type MeasurePreviewLayoutArgs = {
  previewRef: RefObject<ViewInstance | null>;
  layoutRef: RefObject<PreviewLayout>;
  previewWidth: SharedValue<number>;
  previewHeight: SharedValue<number>;
};

function measurePreviewLayout({
  previewRef,
  layoutRef,
  previewWidth,
  previewHeight,
}: MeasurePreviewLayoutArgs) {
  previewRef.current?.measureInWindow((x, y, width, height) => {
    layoutRef.current = { x, y, width, height };
    previewWidth.set(width);
    previewHeight.set(height);
  });
}
