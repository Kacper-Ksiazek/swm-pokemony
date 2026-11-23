import type { PieceColor } from "@/features/chess/assets/chess-assets";

import type { GameOutcome } from "../../../../utils/chess-engine";

/** The side to move is the one that got mated, so the other side won. */
export function deriveGameOutcome(
  isCheckmate: boolean,
  isStalemate: boolean,
  turn: PieceColor,
): GameOutcome | null {
  if (isCheckmate) {
    return turn === "white" ? "black" : "white";
  }

  if (isStalemate) {
    return "draw";
  }

  return null;
}
