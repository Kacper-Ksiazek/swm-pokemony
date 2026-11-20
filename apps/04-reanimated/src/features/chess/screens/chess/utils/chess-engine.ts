import { Game } from "js-chess-engine";
import type { AILevel, BoardConfig } from "js-chess-engine";

import type { PieceColor, PieceType } from "../../../assets/chess-assets";
import { BOARD_SIZE } from "../constants/vice-chess.constants";

/**
 * Thin adapter over `js-chess-engine`. The library owns all chess rules (legal moves,
 * check/mate/stalemate, castling, en passant, promotion). This file only translates between
 * its square strings ("E2") and the row/col model the board UI uses, and keeps stable piece
 * ids so Reanimated can animate a piece from its old square to the new one.
 */

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

const FILES = "ABCDEFGH";

const SYMBOL_TYPES: Record<string, PieceType> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

export function createGame(): Game {
  return new Game();
}

export function squareToPos(square: string): SquarePos {
  return { row: BOARD_SIZE - Number(square[1]), col: FILES.indexOf(square[0]) };
}

export function posToSquare({ row, col }: SquarePos): string {
  return `${FILES[col]}${BOARD_SIZE - row}`;
}

function symbolToPiece(symbol: string, id: string): ChessPiece {
  return {
    id,
    color: symbol === symbol.toUpperCase() ? "white" : "black",
    type: SYMBOL_TYPES[symbol.toLowerCase()],
  };
}

export function createInitialPosition(game: Game): Position {
  const config = game.exportJson();
  const ids: PieceIds = {};
  for (const [square, symbol] of Object.entries(config.pieces)) {
    ids[square] = `${symbol}-${square}`;
  }
  return { config, ids };
}

export function toBoardState({ config, ids }: Position): BoardState {
  const board: BoardState = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );
  for (const [square, symbol] of Object.entries(config.pieces)) {
    const { row, col } = squareToPos(square);
    board[row][col] = symbolToPiece(symbol, ids[square]);
  }
  return board;
}

export function getLegalMoves(game: Game, pos: SquarePos): SquarePos[] {
  const from = posToSquare(pos);
  return (game.moves(from)[from] ?? []).map(squareToPos);
}

/**
 * Asks the engine for the best move without applying it, so the caller plays it through
 * `playMove` and the id tracking / animation stay identical to a human move.
 * `ai()` is synchronous and blocks the JS thread; keep the level low.
 */
export function getAiMove(game: Game, level: AILevel): { from: SquarePos; to: SquarePos } | null {
  if (game.exportJson().isFinished) {
    return null; // ai() throws on a finished game
  }
  // Small randomness: with two AIs playing each other (autopilot) a fully deterministic
  // engine can repeat the same moves forever.
  const { move } = game.ai({ level, play: false, randomness: 30 });
  const [from, to] = Object.entries(move)[0] ?? [];
  return from && to ? { from: squareToPos(from), to: squareToPos(to) } : null;
}

export function findKingPosition(config: BoardConfig, color: PieceColor): SquarePos | null {
  const king = color === "white" ? "K" : "k";
  const square = Object.keys(config.pieces).find((s) => config.pieces[s] === king);
  return square ? squareToPos(square) : null;
}

/**
 * Carries piece ids across a move. The mover keeps its id; a piece that only changed square as
 * a side effect (the rook when castling) is matched by symbol; anything else that vanished is
 * a capture. Promotion needs no special case: the id stays, the symbol (so the sprite) changes.
 */
function reconcileIds(prev: Position, next: BoardConfig, from: string, to: string): PieceIds {
  const ids: PieceIds = { [to]: prev.ids[from] };
  const unclaimed = Object.keys(prev.config.pieces).filter(
    (square) => square !== from && next.pieces[square] !== prev.config.pieces[square],
  );

  for (const [square, symbol] of Object.entries(next.pieces)) {
    if (square === to) {
      continue;
    }
    if (prev.config.pieces[square] === symbol) {
      ids[square] = prev.ids[square];
      continue;
    }
    const sourceIndex = unclaimed.findIndex((s) => prev.config.pieces[s] === symbol);
    if (sourceIndex !== -1) {
      ids[square] = prev.ids[unclaimed[sourceIndex]];
      unclaimed.splice(sourceIndex, 1);
    } else {
      ids[square] = `${symbol}-${square}-new`;
    }
  }

  return ids;
}

export function playMove(
  game: Game,
  prev: Position,
  fromPos: SquarePos,
  toPos: SquarePos,
): PlayedMove {
  const from = posToSquare(fromPos);
  const to = posToSquare(toPos);

  game.move(from, to);
  // Not the object `move()` returns: its checkMate/isFinished flags lag a move behind
  // (check is set, mate is not), so the UI would never see the game end and the AI would
  // be asked to move in a finished game, which throws.
  const config = game.exportJson();
  const ids = reconcileIds(prev, config, from, to);

  const keptIds = new Set(Object.values(ids));
  const capturedSquare = Object.keys(prev.config.pieces).find(
    (square) => !keptIds.has(prev.ids[square]),
  );
  const captured = capturedSquare
    ? symbolToPiece(prev.config.pieces[capturedSquare], prev.ids[capturedSquare])
    : null;

  return { position: { config, ids }, captured };
}
