import { Asset } from "expo-asset";
import { useEffect, useState } from "react";

export const SENSOR_ASSETS = [
  require("./vice-poke-emblem.jpg"),
  require("./vice-backdrop.jpg"),
  require("./player-car.png"),
  require("./traffic-car.png"),
  require("./traffic-moto.png"),
  require("./traffic-bus.png"),
  require("./traffic-police.png"),
  require("./traffic-supercar.png"),
  require("./traffic-truck.png"),
  require("./traffic-taxi.png"),
] as const;

let preloadPromise: Promise<void> | null = null;
let isPreloaded = false;

export function preloadSensorsAssets(): Promise<void> {
  if (isPreloaded) {
    return Promise.resolve();
  }

  if (!preloadPromise) {
    const tasks = SENSOR_ASSETS.map((asset) =>
      Asset.fromModule(asset)
        .downloadAsync()
        .catch(() => false),
    );

    preloadPromise = Promise.all(tasks).then(() => {
      isPreloaded = true;
    });
  }

  return preloadPromise;
}

export function useSensorsAssetsReady(): boolean {
  const [ready, setReady] = useState(isPreloaded);

  useEffect(() => {
    if (isPreloaded) {
      setReady(true);
      return;
    }

    let cancelled = false;
    void preloadSensorsAssets().then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
