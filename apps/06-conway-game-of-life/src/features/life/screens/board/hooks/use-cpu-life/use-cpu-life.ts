import { useCallback, useEffect, useState, type RefObject } from "react";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

import { appendLivingSample } from "../../components/living-chart";
import { frameOf, type BoardCamera, type Viewport } from "../board-camera";
import { createCpuSim, stepCpuFrame } from "./cpu-step";
import { viewKey, visibleCells, type CellPlace, type VisibleCells } from "./visible-cells";

const EMPTY_WINDOW: VisibleCells = {
  originCellX: 0,
  originCellY: 0,
  stride: 1,
  places: [],
};

export type CpuField = {
  places: readonly CellPlace[];
  stride: number;
  originX: SharedValue<number>;
  originY: SharedValue<number>;
  spanX: SharedValue<number>;
  pointsWidth: SharedValue<number>;
};

/**
 * Conway on the JavaScript thread, drawn later as React views.
 * The camera refs stay shared with the gesture, same as the GPU loop.
 */
export function useCpuLife(
  cameraRef: RefObject<BoardCamera>,
  viewportRef: RefObject<Viewport>,
  active: boolean,
) {
  const [living, setLiving] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [runId, setRunId] = useState(0);
  const [cellsWindow, setCellsWindow] = useState<VisibleCells>(EMPTY_WINDOW);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const spanX = useSharedValue(0);
  const pointsWidth = useSharedValue(0);

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

  useEffect(() => {
    if (!active) {
      return;
    }

    const sim = createCpuSim();
    setLiving(sim.living);
    setEpoch(0);
    setHistory([]);
    setStartedAt(null);
    setElapsedMs(0);
    setCellsWindow(EMPTY_WINDOW);

    let frameId = 0;
    let cancelled = false;
    let markedStart = false;
    let drawnKey = "";

    const tick = () => {
      if (cancelled) {
        return;
      }

      frameId = requestAnimationFrame(tick);
      const frame = frameOf(cameraRef.current, viewportRef.current);
      originX.set(frame.originX);
      originY.set(frame.originY);
      spanX.set(frame.spanX);
      pointsWidth.set(viewportRef.current.pointsWidth);

      const key = viewKey(frame, sim.epoch);

      if (key !== drawnKey) {
        drawnKey = key;
        setCellsWindow(visibleCells(sim.current, frame));
      }

      if (!markedStart) {
        markedStart = true;
        setStartedAt(Date.now());
      }

      if (!stepCpuFrame(sim)) {
        return;
      }

      setLiving(sim.living);
      setEpoch(sim.epoch);
      setHistory((points) => appendLivingSample(points, sim.living));
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      setStartedAt(null);
      setElapsedMs(0);
    };
  }, [active, cameraRef, originX, originY, pointsWidth, runId, spanX, viewportRef]);

  const reset = useCallback(() => {
    setRunId((current) => current + 1);
  }, []);

  const field: CpuField = {
    places: cellsWindow.places,
    stride: cellsWindow.stride,
    originX,
    originY,
    spanX,
    pointsWidth,
  };

  return { living, epoch, elapsedMs, history, reset, field };
}
