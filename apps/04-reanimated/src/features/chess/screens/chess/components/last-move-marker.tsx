import { StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import type { PieceColor } from "../../../assets/chess-assets";
import { VICE_CHESS_COLORS } from "../constants/vice-chess.constants";

type LastMoveMarkerProps = {
  /** Colour of the side that just moved, so the marker reads as "their" move. */
  mover: PieceColor;
  kind: "from" | "to";
};

const MARKER_COLORS = {
  white: {
    solid: VICE_CHESS_COLORS.cyan,
    fromFill: "rgba(0, 240, 255, 0.30)",
    fromBorder: "rgba(0, 240, 255, 0.55)",
    toFill: "rgba(0, 240, 255, 0.20)",
  },
  black: {
    solid: VICE_CHESS_COLORS.pink,
    fromFill: "rgba(255, 46, 147, 0.30)",
    fromBorder: "rgba(255, 46, 147, 0.55)",
    toFill: "rgba(255, 46, 147, 0.20)",
  },
} as const;

/**
 * Last-move highlight in the mover's neon colour: a clear tinted square on the square it left and a
 * glowing rounded frame on the square it landed on. Mount it with a key that changes per move
 * so it fades in each time.
 */
export function LastMoveMarker({ mover, kind }: LastMoveMarkerProps) {
  const { solid, fromFill, fromBorder, toFill } = MARKER_COLORS[mover];

  return (
    <Animated.View
      pointerEvents="none"
      entering={FadeIn.duration(260)}
      style={[
        styles.base,
        kind === "to"
          ? [styles.to, { backgroundColor: toFill, borderColor: solid, shadowColor: solid }]
          : [styles.from, { backgroundColor: fromFill, borderColor: fromBorder }],
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFill,
    margin: 3,
    borderRadius: 8,
  },
  from: {
    borderWidth: 1.5,
  },
  to: {
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
  },
});
