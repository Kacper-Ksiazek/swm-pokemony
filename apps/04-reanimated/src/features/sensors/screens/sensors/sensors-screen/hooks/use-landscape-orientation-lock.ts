import { useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";

/** Locks landscape once `readyToRotate` becomes true while focused; restores portrait on leave. */
export function useLandscapeOrientationLock(readyToRotate: boolean) {
  useEffect(() => {
    if (!readyToRotate) {
      return;
    }
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, [readyToRotate]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      };
    }, []),
  );
}
