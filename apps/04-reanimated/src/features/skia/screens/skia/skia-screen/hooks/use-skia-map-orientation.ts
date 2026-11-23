import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";

type SkiaMapOrientationInput = {
  landscape: boolean;
  resetTransform: () => void;
};

export function useSkiaMapOrientation({ landscape, resetTransform }: SkiaMapOrientationInput) {
  useFocusEffect(
    useCallback(
      () => () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      },
      [],
    ),
  );

  function toggleOrientation() {
    resetTransform();
    ScreenOrientation.lockAsync(
      landscape
        ? ScreenOrientation.OrientationLock.PORTRAIT_UP
        : ScreenOrientation.OrientationLock.LANDSCAPE,
    ).catch(() => {});
  }

  return { toggleOrientation };
}
