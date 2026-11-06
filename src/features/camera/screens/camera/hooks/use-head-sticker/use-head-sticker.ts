import { useEffect, useRef, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { type ScannedObject, useObjectOutput } from "react-native-vision-camera";

import type { FaceScanDebug } from "../../devtools";
import { stickerFrameFromFaces } from "../../sticker-frame";
import type { HeadStickerFrame, PreviewLayout } from "../../sticker-frame.types";
import type { UseHeadStickerParams, UseHeadStickerResult } from "./use-head-sticker.types";
import {
  extractScannedFaces,
  FACE_OUTPUT_TYPES,
  flushDebugState,
  INITIAL_DEBUG_STATE,
  INITIAL_PREVIEW_LAYOUT,
  measurePreviewLayout,
} from "./utils";

export function useHeadSticker({
  cameraRef,
  previewRef,
  isFocused,
}: UseHeadStickerParams): UseHeadStickerResult {
  const frame = useSharedValue<HeadStickerFrame | null>(null);
  const previewWidth = useSharedValue(0);
  const previewHeight = useSharedValue(0);

  const layoutRef = useRef<PreviewLayout>(INITIAL_PREVIEW_LAYOUT);
  const [debug, setDebug] = useState<FaceScanDebug>(INITIAL_DEBUG_STATE);
  const debugRef = useRef(debug);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLoggedFaces = useRef<number | null>(null);

  function handleObjectsScanned(objects: ScannedObject[]) {
    const camera = cameraRef.current;
    if (camera == null) {
      return;
    }

    const result = extractScannedFaces(camera, objects);
    if (!result.ok) {
      frame.set(null);
      if (debugRef.current.error !== result.errorMessage) {
        flushDebugState({
          next: {
            scans: debugRef.current.scans,
            faces: 0,
            placed: false,
            error: result.errorMessage,
          },
          immediate: true,
          debugRef,
          flushTimer,
          setDebug,
        });
      }
      return;
    }

    const { faces } = result;
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
        next: INITIAL_DEBUG_STATE,
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
