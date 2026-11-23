import { BOARD_SIZE } from "../../constants/vice-chess.constants";

import type { SquarePos } from "./chess-engine.types";

const FILES = "ABCDEFGH";

export function squareToPos(square: string): SquarePos {
  return { row: BOARD_SIZE - Number(square[1]), col: FILES.indexOf(square[0]) };
}

export function posToSquare({ row, col }: SquarePos): string {
  return `${FILES[col]}${BOARD_SIZE - row}`;
}
