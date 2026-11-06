import type { SharedValue } from "react-native-reanimated";
import type { usePhotoOutput } from "react-native-vision-camera";

import type { HeadStickerFrame } from "../../../sticker-frame.types";
import type { CameraFacing, PendingPhoto } from "../use-save-sticker-photo.types";

type CaptureRawPhotoArgs = {
  photoOutput: ReturnType<typeof usePhotoOutput>;
  frame: SharedValue<HeadStickerFrame | null>;
  previewWidth: SharedValue<number>;
  previewHeight: SharedValue<number>;
  facing: CameraFacing;
};

function fileUri(path: string): string {
  return path.startsWith("file://") ? path : `file://${path}`;
}

export async function captureRawPhotoWithSticker({
  photoOutput,
  frame,
  previewWidth,
  previewHeight,
  facing,
}: CaptureRawPhotoArgs): Promise<PendingPhoto | null> {
  let sticker: HeadStickerFrame | null = null;
  const mirror = facing === "front";

  const photo = await photoOutput.capturePhotoToFile(
    {},
    {
      onWillCapturePhoto: () => {
        const current = frame.get();
        sticker =
          current == null ? null : { left: current.left, top: current.top, size: current.size };
      },
    },
  );

  const width = previewWidth.get();
  const height = previewHeight.get();

  if (sticker == null || width <= 0 || height <= 0) {
    return null;
  }

  return {
    uri: fileUri(photo.filePath),
    frame: sticker,
    width,
    height,
    mirror,
  };
}
