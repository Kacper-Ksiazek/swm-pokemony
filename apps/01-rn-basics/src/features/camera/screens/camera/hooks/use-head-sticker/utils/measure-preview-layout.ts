import type { RefObject } from "react";
import type { ViewInstance } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import type { PreviewLayout } from "../../../sticker-frame.types";

type MeasurePreviewLayoutArgs = {
  previewRef: RefObject<ViewInstance | null>;
  layoutRef: RefObject<PreviewLayout>;
  previewWidth: SharedValue<number>;
  previewHeight: SharedValue<number>;
};

export function measurePreviewLayout({
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
