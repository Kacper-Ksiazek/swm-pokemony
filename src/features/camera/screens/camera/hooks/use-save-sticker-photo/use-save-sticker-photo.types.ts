import type { RefObject } from "react";
import type { SharedValue } from "react-native-reanimated";
import type { ViewShotRef } from "react-native-view-shot";
import type { usePhotoOutput } from "react-native-vision-camera";

import type { HeadStickerFrame } from "../../sticker-frame.types";

export type PreviewSize = {
  width: number;
  height: number;
};

export type CameraFacing = "front" | "back";

export type PendingPhoto = {
  uri: string;
  frame: HeadStickerFrame;
  width: number;
  height: number;
  mirror: boolean;
};

export type ReadyHandlers = {
  resolve: () => void;
  reject: (error: Error) => void;
};

export type UseSaveStickerPhotoParams = {
  frame: SharedValue<HeadStickerFrame | null>;
  previewWidth: SharedValue<number>;
  previewHeight: SharedValue<number>;
  previewSize: PreviewSize;
  facing: CameraFacing;
};

export type UseSaveStickerPhotoResult = {
  photoOutput: ReturnType<typeof usePhotoOutput>;
  shotRef: RefObject<ViewShotRef | null>;
  pending: PendingPhoto | null;
  saving: boolean;
  status: string | null;

  save: () => Promise<void>;
  onCompositionReady: () => void;
  onCompositionFailed: () => void;
};
