import type { BoardConfig } from "js-chess-engine";

import type { PieceColor } from "@/features/chess/assets/chess-assets";

import type { SquarePos } from "./chess-engine.types";
import { squareToPos } from "./square-coords";

export function findKingPosition(config: BoardConfig, color: PieceColor): SquarePos | null {
  const king = color === "white" ? "K" : "k";
  const square = Object.keys(config.pieces).find((s) => config.pieces[s] === king);
  return square ? squareToPos(square) : null;
}
