import type { RefObject } from "react";
import type { ViewInstance } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { CameraRef, useObjectOutput } from "react-native-vision-camera";

import type { FaceScanDebug } from "../../devtools";
import type { HeadStickerFrame } from "../../sticker-frame.types";

export type UseHeadStickerParams = {
  cameraRef: RefObject<CameraRef | null>;
  previewRef: RefObject<ViewInstance | null>;
  isFocused: boolean;
};

export type UseHeadStickerResult = {
  frame: SharedValue<HeadStickerFrame | null>;
  previewWidth: SharedValue<number>;
  previewHeight: SharedValue<number>;
  scannerOutput: ReturnType<typeof useObjectOutput>;
  measurePreview: () => void;
  debug: FaceScanDebug;
};
