import {
  addOrientationChangeListener,
  getOrientationAsync,
  Orientation,
  unlockAsync,
} from "expo-screen-orientation";
import { useEffect, useState } from "react";

export function formatOrientationLabel(orientation: Orientation): string {
  switch (orientation) {
    case Orientation.PORTRAIT_UP:
      return "PORTRAIT_UP";
    case Orientation.PORTRAIT_DOWN:
      return "PORTRAIT_DOWN";
    case Orientation.LANDSCAPE_LEFT:
      return "LANDSCAPE_LEFT";
    case Orientation.LANDSCAPE_RIGHT:
      return "LANDSCAPE_RIGHT";
    default:
      return "UNKNOWN";
  }
}

export function useExpoScreenOrientation() {
  const [orientation, setOrientation] = useState<Orientation | null>(null);

  useEffect(() => {
    let active = true;

    void unlockAsync().catch(() => {
      // Ignore — lock may be unsupported on this platform/build.
    });

    void getOrientationAsync().then((value) => {
      if (active) {
        setOrientation(value);
      }
    });

    const subscription = addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return {
    orientation,
    orientationLabel: orientation === null ? "…" : formatOrientationLabel(orientation),
  };
}
