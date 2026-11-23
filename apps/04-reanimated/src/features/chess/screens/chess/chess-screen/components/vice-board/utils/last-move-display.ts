import type { PieceColor } from "@/features/chess/assets/chess-assets";

import type { BoardState, SquarePos } from "../../../../utils/chess-engine";

export function getLastMoveMover(
  board: BoardState,
  lastMove: { from: SquarePos; to: SquarePos } | null,
): PieceColor | null {
  if (!lastMove) {
    return null;
  }
  return board[lastMove.to.row][lastMove.to.col]?.color ?? null;
}

/** Stable key so last-move overlays re-mount and fade in again after each move. */
export function getLastMoveKey(
  lastMove: { from: SquarePos; to: SquarePos } | null,
  lastMoveMover: PieceColor | null,
): string {
  if (!lastMove || !lastMoveMover) {
    return "none";
  }
  return `${lastMove.from.row}${lastMove.from.col}${lastMove.to.row}${lastMove.to.col}-${lastMoveMover}`;
}
