import { useEffect, useRef } from "react";
import { useSharedValue } from "react-native-reanimated";
import { type ScannedObject, useObjectOutput } from "react-native-vision-camera";

import { stickerFrameFromFaces } from "../../sticker-frame";
import type { HeadStickerFrame, PreviewLayout } from "../../sticker-frame.types";
import type { UseHeadStickerParams, UseHeadStickerResult } from "./use-head-sticker.types";
import {
  extractScannedFaces,
  FACE_OUTPUT_TYPES,
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

  function handleObjectsScanned(objects: ScannedObject[]) {
    const camera = cameraRef.current;
    if (camera == null) {
      return;
    }

    const result = extractScannedFaces(camera, objects);
    if (!result.ok) {
      frame.set(null);
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
      return;
    }

    measurePreviewLayout({ previewRef, layoutRef, previewWidth, previewHeight });
  }, [frame, isFocused, previewHeight, previewRef, previewWidth]);

  return { frame, previewWidth, previewHeight, scannerOutput, measurePreview };
}
