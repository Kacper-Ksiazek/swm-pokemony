import { useEffect, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";
import {
  cancelAnimationFrame,
  requestAnimationFrame,
  useDevice,
  type CanvasRef,
} from "react-native-webgpu";

import { type BoardCamera, type Viewport } from "../../../../board-camera";
import { createGpuResources } from "./create-gpu-resources/create-gpu-resources";
import { runGpuLoop } from "./run-gpu-loop";

type GpuSessionArgs = {
  active: boolean;
  cameraRef: RefObject<BoardCamera>;
  viewportRef: RefObject<Viewport>;
  runId: number;
  setError: Dispatch<SetStateAction<string | null>>;
  setLiving: Dispatch<SetStateAction<number>>;
  setEpoch: Dispatch<SetStateAction<number>>;
  setHistory: Dispatch<SetStateAction<number[]>>;
  setStartedAt: Dispatch<SetStateAction<number | null>>;
  setElapsedMs: Dispatch<SetStateAction<number>>;
};

/** One WebGPU session. A new `runId` destroys the device root and seeds a fresh grid. */
export function useGpuSession({
  active,
  cameraRef,
  viewportRef,
  runId,
  setError,
  setLiving,
  setEpoch,
  setHistory,
  setStartedAt,
  setElapsedMs,
}: GpuSessionArgs) {
  const canvasRef = useRef<CanvasRef>(null);
  const { device } = useDevice();

  useEffect(() => {
    if (!active || !device) {
      return;
    }

    const control = { cancelled: false, frameId: 0 };
    let root: ReturnType<typeof createGpuResources>["root"] | null = null;

    const start = () => {
      if (control.cancelled) {
        return;
      }

      const context = canvasRef.current?.getContext("webgpu");
      const canvas = context?.canvas as HTMLCanvasElement | undefined;

      if (!context || !canvas || canvas.clientWidth === 0 || canvas.clientHeight === 0) {
        control.frameId = requestAnimationFrame(start);

        return;
      }

      try {
        const resources = createGpuResources({ device, context, canvas, cameraRef, viewportRef });
        root = resources.root;
        runGpuLoop({
          control,
          resources,
          cameraRef,
          viewportRef,
          setError,
          setLiving,
          setEpoch,
          setHistory,
          setStartedAt,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "WebGPU setup failed.");
      }
    };

    control.frameId = requestAnimationFrame(start);

    return () => {
      control.cancelled = true;
      cancelAnimationFrame(control.frameId);
      root?.destroy();
      setStartedAt(null);
      setElapsedMs(0);
      setHistory([]);
      setLiving(0);
      setEpoch(0);
    };
  }, [
    active,
    cameraRef,
    device,
    runId,
    setElapsedMs,
    setEpoch,
    setError,
    setHistory,
    setLiving,
    setStartedAt,
    viewportRef,
  ]);

  return canvasRef;
}
