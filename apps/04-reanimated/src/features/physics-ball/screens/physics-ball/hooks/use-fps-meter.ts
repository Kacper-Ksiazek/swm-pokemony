import { useCallback, useEffect, useState } from "react";
import { useIsFocused } from "expo-router";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const SAMPLE_WINDOW_MS = 250;
const MAX_SAMPLES = 28;

export function useFpsMeter() {
  const isFocused = useIsFocused();
  const [samples, setSamples] = useState<number[]>([]);

  const frameCount = useSharedValue(0);
  const elapsedMs = useSharedValue(0);

  const pushSample = useCallback((fps: number) => {
    setSamples((prev) => {
      const next = [...prev, fps];
      return next.length > MAX_SAMPLES ? next.slice(next.length - MAX_SAMPLES) : next;
    });
  }, []);

  const frameCallback = useFrameCallback(
    useCallback(
      (frameInfo) => {
        "worklet";

        const dt = frameInfo.timeSincePreviousFrame;
        if (dt === null || dt <= 0) {
          return;
        }

        const nextCount = frameCount.get() + 1;
        const nextElapsed = elapsedMs.get() + dt;

        if (nextElapsed >= SAMPLE_WINDOW_MS) {
          const fps = Math.min(120, Math.round((nextCount * 1000) / nextElapsed));
          frameCount.set(0);
          elapsedMs.set(0);
          scheduleOnRN(pushSample, fps);
        } else {
          frameCount.set(nextCount);
          elapsedMs.set(nextElapsed);
        }
      },
      [elapsedMs, frameCount, pushSample],
    ),
    false,
  );

  useEffect(() => {
    frameCallback.setActive(isFocused);
  }, [frameCallback, isFocused]);

  const currentFps = samples.length > 0 ? samples[samples.length - 1] : null;

  return {
    samples,
    currentFps,
    maxSamples: MAX_SAMPLES,
  };
}
