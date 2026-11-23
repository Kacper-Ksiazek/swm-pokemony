import type { PieceType } from "@/features/chess/assets/chess-assets";

import type { ChessPiece } from "./chess-engine.types";

const SYMBOL_TYPES: Record<string, PieceType> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

export function symbolToPiece(symbol: string, id: string): ChessPiece {
  return {
    id,
    color: symbol === symbol.toUpperCase() ? "white" : "black",
    type: SYMBOL_TYPES[symbol.toLowerCase()],
  };
}
