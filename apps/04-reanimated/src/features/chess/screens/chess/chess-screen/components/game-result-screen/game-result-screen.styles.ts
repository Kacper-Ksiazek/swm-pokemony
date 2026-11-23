import { StyleSheet } from "react-native";

import { VICE_CHESS_COLORS } from "../../../constants/vice-chess.constants";

export const gameResultScreenStyles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: VICE_CHESS_COLORS.bgDeep,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  center: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  titleBlock: {
    alignItems: "center",
    gap: 6,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 4,
  },
  headline: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 2,
  },
  timeCard: {
    minWidth: 200,
    alignItems: "center",
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: VICE_CHESS_COLORS.cardBg,
  },
  timeLabel: {
    color: VICE_CHESS_COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  timeValue: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 48,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  buttonRow: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  buttonBack: {
    flex: 1,
    borderColor: "rgba(196, 181, 253, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  buttonNew: {
    flex: 1.5,
    borderColor: "transparent",
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  buttonLabelOnColor: {
    color: VICE_CHESS_COLORS.bgDeep,
  },
});
