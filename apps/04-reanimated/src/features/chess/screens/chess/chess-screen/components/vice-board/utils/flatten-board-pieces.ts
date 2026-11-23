import { BOARD_SIZE } from "../../../../constants/vice-chess.constants";
import type { BoardState, ChessPiece } from "../../../../utils/chess-engine";

export type FlattenedPiece = {
  piece: ChessPiece;
  row: number;
  col: number;
};

export function flattenBoardPieces(board: BoardState): FlattenedPiece[] {
  const pieces: FlattenedPiece[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        pieces.push({ piece, row, col });
      }
    }
  }
  return pieces;
}
