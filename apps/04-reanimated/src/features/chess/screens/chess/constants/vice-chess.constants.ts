export const VICE_CHESS_COLORS = {
  bgDeep: "#090514",
  cardBg: "rgba(18, 10, 36, 0.92)",
  pink: "#FF2E93",
  cyan: "#00F0FF",
  gold: "#FFD600",
  purple: "#9D4EDD",
  danger: "#FF3B5C",
  textPrimary: "#FFFFFF",
  textMuted: "#C4B5FD",
  selectedSquare: "rgba(0, 240, 255, 0.34)",
  selectedBorder: "#00F0FF",
  legalMoveDot: "rgba(0, 240, 255, 0.85)",
  legalCaptureRing: "rgba(255, 46, 147, 0.9)",
} as const;

export const BOARD_SIZE = 8;

/** js-chess-engine `AILevel` (1–5). Search is sync and blocks the JS thread — keep low on device. */
export const CYAN_AI_SKILL = 2;

/** Black / VICE — player 2. */
export const VICE_AI_SKILL = 2;
