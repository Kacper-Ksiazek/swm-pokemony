import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";

/** Locks landscape while the sensors route is focused; restores portrait on leave. */
export function useLandscapeOrientationLock() {
  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});

      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      };
    }, []),
  );
}
