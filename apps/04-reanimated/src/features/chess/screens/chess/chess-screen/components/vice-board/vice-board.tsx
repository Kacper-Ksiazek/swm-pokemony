import { Image } from "expo-image";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { CHESS_BOARD_IMAGE } from "@/features/chess/assets/chess-assets";

import { BOARD_SIZE, VICE_CHESS_COLORS } from "../../../constants/vice-chess.constants";
import { useViceNeonPulse } from "../../hooks/use-vice-neon-pulse";
import type { BoardState, GameOutcome, SquarePos } from "../../../utils/chess-engine";

import { BoardGrid } from "./components/board-grid";
import { useCheckmateBoardWash } from "./hooks/use-checkmate-board-wash";
import { BOARD_INSET_RATIO } from "./vice-board.constants";
import { viceBoardStyles as styles } from "./vice-board.styles";
import { flattenBoardPieces } from "./utils/flatten-board-pieces";
import { getLastMoveKey, getLastMoveMover } from "./utils/last-move-display";

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

  const lastMoveMover = getLastMoveMover(board, lastMove);
  const lastMoveKey = getLastMoveKey(lastMove, lastMoveMover);
  const pieces = flattenBoardPieces(board);

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
          <BoardGrid
            board={board}
            squareSize={squareSize}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            lastMoveMover={lastMoveMover}
            lastMoveKey={lastMoveKey}
            checkedKingPos={checkedKingPos}
            pieces={pieces}
            onSquarePress={onSquarePress}
          />
        </View>
      </Animated.View>
    </View>
  );
}
