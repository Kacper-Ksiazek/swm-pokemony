import { useCallback, useEffect, useState, type RefObject } from "react";

import { type BoardCamera, type Viewport } from "../board-camera";
import { useGpuSession } from "./hooks/use-gpu-session/use-gpu-session";

/**
 * Owns the WebGPU canvas for one board.
 *
 * The generation itself is `step.dispatchThreads`: one GPU thread per cell. Two storage
 * buffers swap roles each step. Each living cell adds 1 to its row counter and paints its
 * texel; a short copy turns those atomics into numbers JavaScript can add. The fragment
 * shader samples the texels behind each screen pixel through `cameraRef`, so a pinch
 * or a drag shows up on the next frame without rebuilding the pipelines.
 */
export function useLifeCanvas(cameraRef: RefObject<BoardCamera>, viewportRef: RefObject<Viewport>) {
  const [error, setError] = useState<string | null>(null);
  const [living, setLiving] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (startedAt === null) {
      return;
    }

    setElapsedMs(Date.now() - startedAt);
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt]);

  const canvasRef = useGpuSession({
    cameraRef,
    viewportRef,
    runId,
    setError,
    setLiving,
    setEpoch,
    setHistory,
    setStartedAt,
    setElapsedMs,
  });

  const reset = useCallback(() => {
    setError(null);
    setRunId((current) => current + 1);
  }, []);

  return { canvasRef, error, living, epoch, elapsedMs, history, reset };
}
