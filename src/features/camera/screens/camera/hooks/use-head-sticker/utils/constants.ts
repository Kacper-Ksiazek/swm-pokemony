import type { ScannedObjectType } from "react-native-vision-camera";

import type { PreviewLayout } from "../../../sticker-frame.types";

export const FACE_OUTPUT_TYPES: ScannedObjectType[] = ["face"];

export const INITIAL_PREVIEW_LAYOUT: PreviewLayout = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};
