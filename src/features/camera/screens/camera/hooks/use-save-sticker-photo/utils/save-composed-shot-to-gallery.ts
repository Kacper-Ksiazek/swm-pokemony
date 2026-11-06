import { Asset } from "expo-media-library";
import type { RefObject } from "react";
import { releaseCapture, type ViewShotRef } from "react-native-view-shot";

function fileUri(path: string): string {
  return path.startsWith("file://") ? path : `file://${path}`;
}

function waitForFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

export async function saveComposedShotToGallery(
  shotRef: RefObject<ViewShotRef | null>,
): Promise<boolean> {
  await waitForFrames();

  const shot = await shotRef.current?.capture();

  if (shot == null) {
    return false;
  }

  await Asset.create(fileUri(shot));
  releaseCapture(shot);

  return true;
}
