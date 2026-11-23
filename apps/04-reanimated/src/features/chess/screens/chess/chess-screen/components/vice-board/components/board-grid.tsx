import { Pressable, View } from "react-native";

import type { PieceColor } from "@/features/chess/assets/chess-assets";

import { BOARD_SIZE } from "../../../../constants/vice-chess.constants";
import type { BoardState, SquarePos } from "../../../../utils/chess-engine";

import { viceBoardStyles as styles } from "../vice-board.styles";
import type { FlattenedPiece } from "../utils/flatten-board-pieces";

import { CheckMarker } from "./check-marker";
import { ChessPiece } from "./chess-piece";
import { LastMoveMarker } from "./last-move-marker";
import { MoveTrail } from "./move-trail";

type BoardGridProps = {
  board: BoardState;
  squareSize: number;
  selectedSquare: SquarePos | null;
  legalMoves: SquarePos[];
  lastMove: { from: SquarePos; to: SquarePos } | null;
  lastMoveMover: PieceColor | null;
  lastMoveKey: string;
  checkedKingPos: SquarePos | null;
  pieces: FlattenedPiece[];
  onSquarePress: (pos: SquarePos) => void;
};

export function BoardGrid({
  board,
  squareSize,
  selectedSquare,
  legalMoves,
  lastMove,
  lastMoveMover,
  lastMoveKey,
  checkedKingPos,
  pieces,
  onSquarePress,
}: BoardGridProps) {
  return (
    <>
      {Array.from({ length: BOARD_SIZE }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: BOARD_SIZE }, (__, col) => {
            const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
            const isLegal = legalMoves.some((m) => m.row === row && m.col === col);
            const isLastMoveFrom = lastMove?.from.row === row && lastMove?.from.col === col;
            const isLastMoveTo = lastMove?.to.row === row && lastMove?.to.col === col;
            const isCheckedKing = checkedKingPos?.row === row && checkedKingPos?.col === col;
            const hasPiece = board[row][col] !== null;

            return (
              <Pressable
                key={`${row}-${col}`}
                onPress={() => onSquarePress({ row, col })}
                style={[
                  styles.square,
                  { width: squareSize, height: squareSize },
                  isSelected && styles.selectedSquare,
                ]}
              >
                {isCheckedKing && <CheckMarker />}
                {lastMove && (isLastMoveFrom || isLastMoveTo) && lastMoveMover && (
                  <LastMoveMarker
                    key={lastMoveKey}
                    mover={lastMoveMover}
                    kind={isLastMoveTo ? "to" : "from"}
                  />
                )}
                {isLegal && !hasPiece && (
                  <View
                    style={[
                      styles.legalDot,
                      {
                        width: squareSize * 0.28,
                        height: squareSize * 0.28,
                        borderRadius: squareSize * 0.14,
                      },
                    ]}
                  />
                )}
                {isLegal && hasPiece && (
                  <View
                    style={[
                      styles.legalCaptureRing,
                      {
                        width: squareSize * 0.86,
                        height: squareSize * 0.86,
                        borderRadius: squareSize * 0.43,
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      {lastMove && lastMoveMover && (
        <MoveTrail
          key={lastMoveKey}
          from={lastMove.from}
          to={lastMove.to}
          squareSize={squareSize}
          mover={lastMoveMover}
        />
      )}

      {pieces.map(({ piece, row, col }) => (
        <ChessPiece
          key={piece.id}
          piece={piece}
          row={row}
          col={col}
          squareSize={squareSize}
          isSelected={selectedSquare?.row === row && selectedSquare?.col === col}
        />
      ))}
    </>
  );
}
