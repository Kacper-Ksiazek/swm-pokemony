import type { PieceColor, PieceType } from "@/features/chess/assets/chess-assets";
import type { BoardConfig } from "js-chess-engine";

export type ChessPiece = {
  id: string;
  color: PieceColor;
  type: PieceType;
};

/** Who won: the winning colour, or a draw (stalemate). */
export type GameOutcome = PieceColor | "draw";

export type SquarePos = {
  row: number;
  col: number;
};

export type BoardState = (ChessPiece | null)[][];

/** Square -> stable piece id. The library has no piece identity, so we track it ourselves. */
export type PieceIds = Record<string, string>;

export type Position = {
  config: BoardConfig;
  ids: PieceIds;
};

export type PlayedMove = {
  position: Position;
  captured: ChessPiece | null;
};
