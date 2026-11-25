import type { Dispatch, RefObject, SetStateAction } from "react";
import { requestAnimationFrame } from "react-native-webgpu";
import { d } from "typegpu";

import { GRID_HEIGHT, GRID_WIDTH, sumRowCounts } from "../../../../../../../simulation/grid";
import { appendLivingSample } from "../../../../../components/living-chart";
import { frameOf, type BoardCamera, type Viewport } from "../../../../board-camera";
import { type createGpuResources } from "./create-gpu-resources/create-gpu-resources";

const STEP_MS = 100;

type FrameControl = {
  cancelled: boolean;
  frameId: number;
};

type RunGpuLoopArgs = {
  control: FrameControl;
  resources: ReturnType<typeof createGpuResources>;
  cameraRef: RefObject<BoardCamera>;
  viewportRef: RefObject<Viewport>;
  setError: Dispatch<SetStateAction<string | null>>;
  setLiving: Dispatch<SetStateAction<number>>;
  setEpoch: Dispatch<SetStateAction<number>>;
  setHistory: Dispatch<SetStateAction<number[]>>;
  setStartedAt: Dispatch<SetStateAction<number | null>>;
};

/**
 * Schedules the next frame before any step.
 * A failed row read leaves the step in flight, so later generations do not start.
 */
export function runGpuLoop({
  control,
  resources,
  cameraRef,
  viewportRef,
  setError,
  setLiving,
  setEpoch,
  setHistory,
  setStartedAt,
}: RunGpuLoopArgs) {
  const {
    step,
    draw,
    copy,
    rowAtomics,
    rowPlain,
    steps,
    frame,
    copyGroup,
    cameraBuffer,
    context,
    canvas,
  } = resources;

  let swap = 0;
  let lastStepAt = 0;
  let epochCount = 0;
  let reading = false;
  let hasFrame = false;
  let markedStart = false;

  const paint = () => {
    const view = frameOf(cameraRef.current, viewportRef.current);
    cameraBuffer.write({
      origin: d.vec2f(view.originX, view.originY),
      span: d.vec2f(view.spanX, view.spanY),
      pixels: d.vec2f(canvas.width, canvas.height),
      pad: d.vec2f(0, 0),
    });
    draw
      .withColorAttachment({
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        storeOp: "store",
      })
      .with(frame)
      .draw(3);
    context.present();
  };

  const tick = (time: number) => {
    if (control.cancelled) {
      return;
    }

    control.frameId = requestAnimationFrame(tick);

    if (!reading && time - lastStepAt >= STEP_MS) {
      lastStepAt = time;
      reading = true;

      if (!markedStart) {
        markedStart = true;
        setStartedAt(Date.now());
      }
      rowAtomics.clear();
      step.with(steps[swap]).dispatchThreads(GRID_WIDTH, GRID_HEIGHT);
      copy.with(copyGroup).dispatchThreads(GRID_HEIGHT);
      swap ^= 1;
      hasFrame = true;

      void rowPlain.read().then(
        (rows) => {
          if (control.cancelled) {
            return;
          }

          epochCount += 1;
          const livingCount = sumRowCounts(rows);
          setLiving(livingCount);
          setEpoch(epochCount);
          setHistory((points) => appendLivingSample(points, livingCount));
          reading = false;
        },
        (err: unknown) => {
          if (control.cancelled) {
            return;
          }

          setError(err instanceof Error ? err.message : "Could not read the living-cell count.");
        },
      );
    }

    if (hasFrame) {
      paint();
    }
  };

  control.frameId = requestAnimationFrame(tick);
}
