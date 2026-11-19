import { describeArc } from "./utils/speed-gauge-arc";

export const GAUGE_SIZE = 112;
export const GAUGE_CX = GAUGE_SIZE / 2;
export const GAUGE_CY = GAUGE_SIZE / 2 + 4;
export const GAUGE_RADIUS = 42;
export const GAUGE_STROKE_WIDTH = 9;
export const GAUGE_START_ANGLE_DEG = 150;
export const GAUGE_SWEEP_DEG = 240;

export const GAUGE_TRACK_PATH = describeArc(
  GAUGE_CX,
  GAUGE_CY,
  GAUGE_RADIUS,
  GAUGE_START_ANGLE_DEG,
  GAUGE_START_ANGLE_DEG + GAUGE_SWEEP_DEG,
);

export const GAUGE_INITIAL_ARC_PATH = describeArc(
  GAUGE_CX,
  GAUGE_CY,
  GAUGE_RADIUS,
  GAUGE_START_ANGLE_DEG,
  GAUGE_START_ANGLE_DEG + 48,
);
