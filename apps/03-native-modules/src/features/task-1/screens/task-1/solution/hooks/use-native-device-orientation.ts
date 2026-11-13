import {
  addOrientationChangeListener,
  getOrientationAsync,
  type KksiazekOrientation,
} from "kksiazek-device-orientation";
import { useEffect, useState } from "react";

export function formatNativeOrientationLabel(orientation: KksiazekOrientation): string {
  return orientation;
}

export function useNativeDeviceOrientation() {
  const [orientation, setOrientation] = useState<KksiazekOrientation | null>(null);

  useEffect(() => {
    let active = true;

    getOrientationAsync().then((value) => {
      if (active) {
        setOrientation(value);
      }
    });

    const subscription = addOrientationChangeListener((event) => {
      setOrientation(event.orientation);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return {
    orientation,
    orientationLabel: orientation === null ? "…" : formatNativeOrientationLabel(orientation),
  };
}
