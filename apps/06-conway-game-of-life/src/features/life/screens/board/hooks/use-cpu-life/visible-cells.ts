import { GRID_HEIGHT, GRID_WIDTH } from "../../../../simulation/grid";
import { type CameraFrame } from "../board-camera";

/**
 * One React view per living cell until the window no longer fits on screen.
 * Past that, one view covers a square block. A view per cell of the 4096 grid would run out of memory.
 */
const MAX_PLACES = 4096;

export type CellPlace = {
  x: number;
  y: number;
};

export type VisibleCells = {
  originCellX: number;
  originCellY: number;
  stride: number;
  places: CellPlace[];
};

export function visibleCells(cells: Uint32Array, frame: CameraFrame): VisibleCells {
  const { x0, y0, x1, y1, stride } = boundsOf(frame);
  const places: CellPlace[] = [];

  for (let y = y0; y < y1; y += stride) {
    for (let x = x0; x < x1; x += stride) {
      if (blockHasLife(cells, x, y, stride, x1, y1)) {
        places.push({ x, y });
      }
    }
  }

  return { originCellX: x0, originCellY: y0, stride, places };
}

/** Changes when the mounted views must be rebuilt: a new generation, or the camera crossed a cell. */
export function viewKey(frame: CameraFrame, epoch: number): string {
  const { x0, y0, x1, y1, stride } = boundsOf(frame);

  return `${epoch}:${x0}:${y0}:${x1}:${y1}:${stride}`;
}

function boundsOf(frame: CameraFrame) {
  const x0 = clampIndex(Math.floor(frame.originX), GRID_WIDTH);
  const y0 = clampIndex(Math.floor(frame.originY), GRID_HEIGHT);
  const x1 = clampIndex(Math.ceil(frame.originX + frame.spanX), GRID_WIDTH);
  const y1 = clampIndex(Math.ceil(frame.originY + frame.spanY), GRID_HEIGHT);
  const columns = Math.max(0, x1 - x0);
  const rows = Math.max(0, y1 - y0);
  const stride = Math.max(1, Math.ceil(Math.sqrt((columns * rows) / MAX_PLACES)));

  return { x0, y0, x1, y1, stride };
}

function blockHasLife(
  cells: Uint32Array,
  x0: number,
  y0: number,
  stride: number,
  limitX: number,
  limitY: number,
): boolean {
  const x1 = Math.min(x0 + stride, limitX);
  const y1 = Math.min(y0 + stride, limitY);

  for (let y = y0; y < y1; y += 1) {
    const row = y * GRID_WIDTH;

    for (let x = x0; x < x1; x += 1) {
      if (cells[row + x] === 1) {
        return true;
      }
    }
  }

  return false;
}

function clampIndex(value: number, limit: number): number {
  return Math.min(Math.max(value, 0), limit);
}
