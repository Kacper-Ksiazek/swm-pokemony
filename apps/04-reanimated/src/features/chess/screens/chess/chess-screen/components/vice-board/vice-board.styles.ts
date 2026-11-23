import { StyleSheet } from "react-native";

import { VICE_CHESS_COLORS } from "../../../constants/vice-chess.constants";

export const viceBoardStyles = StyleSheet.create({
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
