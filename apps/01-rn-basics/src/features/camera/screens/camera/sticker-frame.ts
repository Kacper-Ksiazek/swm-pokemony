import type { FaceBounds, HeadStickerFrame, PreviewLayout } from "./sticker-frame.types";

const STICKER_TO_FACE = 0.7;

export function stickerFrameFromFaces(
  faces: readonly { bounds: FaceBounds }[],
  preview: PreviewLayout,
): HeadStickerFrame | null {
  if (preview.width <= 0 || preview.height <= 0) {
    return null;
  }

  let largest: FaceBounds | null = null;
  let largestArea = 0;

  for (const face of faces) {
    const area = face.bounds.width * face.bounds.height;

    if (area > largestArea) {
      largest = face.bounds;
      largestArea = area;
    }
  }

  if (largest == null) {
    return null;
  }

  const size = largest.width * STICKER_TO_FACE;
  const localX = largest.x - preview.x + (largest.width - size) / 2;
  const localY = largest.y - preview.y + (largest.height - size) / 2;
  const centerX = localX + size / 2;
  const centerY = localY + size / 2;

  if (centerX < 0 || centerY < 0 || centerX > preview.width || centerY > preview.height) {
    return null;
  }

  return {
    left: localX / preview.width,
    top: localY / preview.height,
    size: size / preview.width,
  };
}
