import { type CameraRef, isScannedFace, type ScannedObject } from "react-native-vision-camera";

import type { FaceBounds } from "../../../sticker-frame.types";

type ExtractScannedFacesResult =
  { ok: true; faces: { bounds: FaceBounds }[] } | { ok: false; errorMessage: string };

export function extractScannedFaces(
  camera: CameraRef,
  objects: ScannedObject[],
): ExtractScannedFacesResult {
  const faces: { bounds: FaceBounds }[] = [];

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
      const errorMessage = error instanceof Error ? error.message : "Face scan failed";
      return { ok: false, errorMessage };
    }
  }

  return { ok: true, faces };
}
