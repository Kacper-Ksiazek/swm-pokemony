import { GRID_HEIGHT, GRID_WIDTH } from "../../../simulation/grid";

/** Whole grid on screen. Pinching in raises this until `MAX_CELLS_ACROSS` cells fill the width. */
export const MIN_ZOOM = 1;
export const MAX_ZOOM = GRID_WIDTH / 16;

/**
 * Opening view: each cell is about this many points wide, so the field starts
 * readable instead of a full 4096-wide dusting.
 */
const CELL_POINTS = 6;

export type BoardCamera = {
  centerX: number;
  centerY: number;
  zoom: number;
};

export type Viewport = {
  pointsWidth: number;
  pointsHeight: number;
  pixelsWidth: number;
  pixelsHeight: number;
};

export type CameraFrame = {
  originX: number;
  originY: number;
  spanX: number;
  spanY: number;
};

export function createBoardCamera(): BoardCamera {
  return { centerX: GRID_WIDTH / 2, centerY: GRID_HEIGHT / 2, zoom: MIN_ZOOM };
}

/** Sets the opening zoom from the board width. Later pinches replace it. */
export function zoomToCellSize(camera: BoardCamera, viewport: Viewport) {
  if (viewport.pointsWidth <= 0) {
    return;
  }

  camera.zoom = clamp(CELL_POINTS * (GRID_WIDTH / viewport.pointsWidth), MIN_ZOOM, MAX_ZOOM);
  clampCenter(camera, viewport);
}

export function panBy(camera: BoardCamera, viewport: Viewport, pointsX: number, pointsY: number) {
  if (viewport.pointsWidth <= 0 || viewport.pointsHeight <= 0) {
    return;
  }

  const spanX = GRID_WIDTH / camera.zoom;
  const spanY = spanX * (viewport.pixelsHeight / viewport.pixelsWidth);
  camera.centerX -= (pointsX / viewport.pointsWidth) * spanX;
  camera.centerY -= (pointsY / viewport.pointsHeight) * spanY;
  clampCenter(camera, viewport);
}

/**
 * Multiplies the zoom, keeping the cell under the pinch focal point still.
 * `focalX` and `focalY` are in points, measured from the board's top-left.
 */
export function zoomAt(
  camera: BoardCamera,
  factor: number,
  focalX: number,
  focalY: number,
  viewport: Viewport,
) {
  if (factor <= 0 || viewport.pointsWidth <= 0 || viewport.pointsHeight <= 0) {
    return;
  }

  const before = frameOf(camera, viewport);
  const unitX = focalX / viewport.pointsWidth;
  const unitY = focalY / viewport.pointsHeight;
  const cellX = before.originX + unitX * before.spanX;
  const cellY = before.originY + unitY * before.spanY;

  camera.zoom = clamp(camera.zoom * factor, MIN_ZOOM, MAX_ZOOM);

  const spanX = GRID_WIDTH / camera.zoom;
  const spanY = spanX * (viewport.pixelsHeight / viewport.pixelsWidth);
  camera.centerX = cellX + (0.5 - unitX) * spanX;
  camera.centerY = cellY + (0.5 - unitY) * spanY;
  clampCenter(camera, viewport);
}

export function frameOf(camera: BoardCamera, viewport: Viewport): CameraFrame {
  const spanX = GRID_WIDTH / camera.zoom;
  const spanY =
    viewport.pixelsWidth > 0 ? spanX * (viewport.pixelsHeight / viewport.pixelsWidth) : spanX;
  const originX = windowOrigin(camera.centerX, spanX, GRID_WIDTH);
  const originY = windowOrigin(camera.centerY, spanY, GRID_HEIGHT);

  return { originX, originY, spanX, spanY };
}

function clampCenter(camera: BoardCamera, viewport: Viewport) {
  const spanX = GRID_WIDTH / camera.zoom;
  const spanY =
    viewport.pixelsWidth > 0 ? spanX * (viewport.pixelsHeight / viewport.pixelsWidth) : spanX;
  camera.centerX = clampAxis(camera.centerX, spanX, GRID_WIDTH);
  camera.centerY = clampAxis(camera.centerY, spanY, GRID_HEIGHT);
}

function clampAxis(center: number, span: number, limit: number): number {
  if (span >= limit) {
    return limit / 2;
  }

  const half = span / 2;

  return clamp(center, half, limit - half);
}

function windowOrigin(center: number, span: number, limit: number): number {
  if (span >= limit) {
    return (limit - span) / 2;
  }

  return clampAxis(center, span, limit) - span / 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
