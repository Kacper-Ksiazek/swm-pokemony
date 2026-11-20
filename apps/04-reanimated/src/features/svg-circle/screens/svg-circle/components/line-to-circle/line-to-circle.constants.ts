import type { TimelineSegment } from "../duration-bar";

export const CANVAS_SIZE = 280;
export const CENTER = CANVAS_SIZE / 2;
export const RADIUS = 72;
export const SEGMENTS = 72;
export const STROKE_WIDTH = 10;
export const STROKE_COLOR = "#FF0000";
export const INITIAL_PATH = `M ${CENTER - RADIUS} ${CENTER} L ${CENTER + RADIUS} ${CENTER}`;

export const DELAY_MS = 450;
export const MORPH_MS = 1600;
export const TOTAL_CYCLE_MS = DELAY_MS + MORPH_MS + DELAY_MS + MORPH_MS;

export const TIMELINE_SEGMENTS: TimelineSegment[] = [
  { label: "Delay", durationMs: DELAY_MS, color: "#D4D4D8" },
  { label: "Line → ○", durationMs: MORPH_MS, color: "#E3350D" },
  { label: "Delay", durationMs: DELAY_MS, color: "#D4D4D8" },
  { label: "○ → Line", durationMs: MORPH_MS, color: "#F27A61" },
];
