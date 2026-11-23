import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import type { PieceColor } from "@/features/chess/assets/chess-assets";

import { VICE_CHESS_COLORS } from "../../../../constants/vice-chess.constants";
import type { SquarePos } from "../../../../utils/chess-engine";

type MoveTrailProps = {
  from: SquarePos;
  to: SquarePos;
  squareSize: number;
  mover: PieceColor;
};

const TRAIL_COLORS = {
  white: { rgb: "0, 240, 255", glow: VICE_CHESS_COLORS.cyan },
  black: { rgb: "255, 46, 147", glow: VICE_CHESS_COLORS.pink },
} as const;

/** Spacing between footprints, as a fraction of a square. */
const STEP = 0.3;
/** The dots finish appearing about when the piece's spring lands. */
const DRAW_MS = 300;

/**
 * A light trail of glowing footprints from the square a piece left to the one it reached, in
 * the mover's colour. The dots fade in one after another along the path (tail faint, head
 * brighter) so it reads as the piece's wake. Render it under the pieces with a key that changes
 * per move: the old trail then fades out while the new one draws itself.
 */
export function MoveTrail({ from, to, squareSize, mover }: MoveTrailProps) {
  const { rgb, glow } = TRAIL_COLORS[mover];

  const dx = (to.col - from.col) * squareSize;
  const dy = (to.row - from.row) * squareSize;
  const distance = Math.hypot(dx, dy);
  const count = Math.max(3, Math.round(distance / (squareSize * STEP)));

  const startX = from.col * squareSize + squareSize / 2;
  const startY = from.row * squareSize + squareSize / 2;

  return (
    <Animated.View
      pointerEvents="none"
      exiting={FadeOut.duration(350)}
      style={StyleSheet.absoluteFill}
    >
      {Array.from({ length: count }, (_, i) => {
        // Keep clear of the two square centres, where the pieces themselves stand.
        const t = 0.1 + (0.78 * i) / (count - 1);
        // Even the tail stays clearly visible; the head is just bigger and brighter.
        const size = squareSize * (0.15 + 0.1 * t);

        return (
          <Animated.View
            key={i}
            entering={FadeIn.delay(60 + (DRAW_MS * i) / count).duration(220)}
            style={[
              styles.dot,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                left: startX + dx * t - size / 2,
                top: startY + dy * t - size / 2,
                backgroundColor: `rgba(${rgb}, ${0.55 + 0.4 * t})`,
                shadowColor: glow,
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
});
