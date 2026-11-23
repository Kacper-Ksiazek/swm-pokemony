import { Game } from "js-chess-engine";

import { BOARD_SIZE } from "../../constants/vice-chess.constants";

import type { BoardState, PieceIds, Position } from "./chess-engine.types";
import { squareToPos } from "./square-coords";
import { symbolToPiece } from "./symbol-to-piece";

export function createGame(): Game {
  return new Game();
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
