import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { CHESS_BOARD_IMAGE } from "@/features/chess/assets/chess-assets";

import { BOARD_SIZE, VICE_CHESS_COLORS } from "../../../constants/vice-chess.constants";
import { useViceNeonPulse } from "../../hooks/use-vice-neon-pulse";
import type {
  BoardState,
  ChessPiece as ChessPieceModel,
  GameOutcome,
  SquarePos,
} from "../../../utils/chess-engine";
import { CheckMarker } from "./components/check-marker";
import { ChessPiece } from "./components/chess-piece";
import { LastMoveMarker } from "./components/last-move-marker";
import { MoveTrail } from "./components/move-trail";
import { useCheckmateBoardWash } from "./hooks/use-checkmate-board-wash";

type ViceBoardProps = {
  board: BoardState;
  boardSize: number;
  autopilotActive?: boolean;
  checkmateWinner?: Exclude<GameOutcome, "draw"> | null;
  selectedSquare: SquarePos | null;
  legalMoves: SquarePos[];
  lastMove: { from: SquarePos; to: SquarePos } | null;
  checkedKingPos: SquarePos | null;
  onSquarePress: (pos: SquarePos) => void;
};

type FlattenedPiece = {
  piece: ChessPieceModel;
  row: number;
  col: number;
};

const BOARD_INSET_RATIO = 0.02;

export function ViceBoard({
  board,
  boardSize,
  autopilotActive = false,
  checkmateWinner = null,
  selectedSquare,
  legalMoves,
  lastMove,
  checkedKingPos,
  onSquarePress,
}: ViceBoardProps) {
  const { neonBorderStyle: frameBorderStyle, neonGlowStyle: glowShellStyle } =
    useViceNeonPulse(autopilotActive);
  const checkmateWashStyle = useCheckmateBoardWash(checkmateWinner);

  const checkmateWashColor =
    checkmateWinner === "white"
      ? VICE_CHESS_COLORS.cyan
      : checkmateWinner === "black"
        ? VICE_CHESS_COLORS.pink
        : undefined;

  const inset = boardSize * BOARD_INSET_RATIO;
  const innerSize = boardSize - inset * 2;
  const squareSize = innerSize / BOARD_SIZE;

  // The mover is whoever now stands on the destination square. The key changes with every
  // move so the marker re-mounts and fades in again.
  const lastMoveMover = lastMove ? (board[lastMove.to.row][lastMove.to.col]?.color ?? null) : null;
  const lastMoveKey = lastMove
    ? `${lastMove.from.row}${lastMove.from.col}${lastMove.to.row}${lastMove.to.col}-${lastMoveMover}`
    : "none";

  const pieces: FlattenedPiece[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        pieces.push({ piece, row, col });
      }
    }
  }

  return (
    <View style={[styles.boardOuter, { width: boardSize, height: boardSize }]}>
      {autopilotActive && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowShell,
            { width: boardSize, height: boardSize, borderRadius: 12 },
            glowShellStyle,
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.boardFrame,
          { width: boardSize, height: boardSize },
          autopilotActive && styles.boardFrameAutopilot,
          autopilotActive && frameBorderStyle,
        ]}
      >
        <Image
          source={CHESS_BOARD_IMAGE}
          style={styles.boardImage}
          contentFit="cover"
          transition={0}
        />

        {checkmateWinner && checkmateWashColor ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.checkmateWash,
              { backgroundColor: checkmateWashColor },
              checkmateWashStyle,
            ]}
          />
        ) : null}

        <View
          style={[
            styles.gridOverlay,
            { top: inset, left: inset, width: innerSize, height: innerSize },
          ]}
        >
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
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowShell: {
    position: "absolute",
    backgroundColor: VICE_CHESS_COLORS.bgDeep,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  boardFrame: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: VICE_CHESS_COLORS.pink,
    shadowColor: VICE_CHESS_COLORS.pink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },
  boardFrameAutopilot: {
    shadowOpacity: 0,
    elevation: 0,
  },
  boardImage: {
    ...StyleSheet.absoluteFill,
    borderRadius: 10,
  },
  checkmateWash: {
    ...StyleSheet.absoluteFill,
    borderRadius: 10,
  },
  gridOverlay: {
    position: "absolute",
  },
  row: {
    flexDirection: "row",
  },
  square: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedSquare: {
    backgroundColor: VICE_CHESS_COLORS.selectedSquare,
    borderWidth: 2,
    borderColor: VICE_CHESS_COLORS.selectedBorder,
  },
  legalDot: {
    backgroundColor: VICE_CHESS_COLORS.legalMoveDot,
    shadowColor: VICE_CHESS_COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  legalCaptureRing: {
    borderWidth: 3,
    borderColor: VICE_CHESS_COLORS.legalCaptureRing,
  },
});
