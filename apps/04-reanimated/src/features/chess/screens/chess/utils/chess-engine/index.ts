/**
 * Thin adapter over `js-chess-engine`. The library owns all chess rules (legal moves,
 * check/mate/stalemate, castling, en passant, promotion). This folder translates between
 * its square strings ("E2") and the row/col model the board UI uses, and keeps stable piece
 * ids so Reanimated can animate a piece from its old square to the new one.
 */

export type {
  BoardState,
  ChessPiece,
  GameOutcome,
  PieceIds,
  PlayedMove,
  Position,
  SquarePos,
} from "./chess-engine.types";

export { createGame, createInitialPosition, toBoardState } from "./board-state";
export { getAiMove } from "./ai-move";
export { findKingPosition } from "./king-position";
export { getLegalMoves } from "./legal-moves";
export { playMove } from "./play-move";
export { posToSquare, squareToPos } from "./square-coords";
