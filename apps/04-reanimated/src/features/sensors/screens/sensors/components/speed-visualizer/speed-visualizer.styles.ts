import { StyleSheet } from "react-native";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import { VICE_COLORS } from "../../constants";
import { GAUGE_SIZE } from "./speed-visualizer.constants";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: VICE_COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: VICE_COLORS.cardBorderPink,
    borderRadius: theme.radius.md,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    shadowColor: VICE_COLORS.pink,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  gaugeWrapper: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  centerReadout: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  speedValue: {
    fontSize: 22,
    fontWeight: "900",
    color: VICE_COLORS.textPrimary,
    fontFamily: monoFont,
    fontVariant: ["tabular-nums"],
    lineHeight: 24,
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: "700",
    color: VICE_COLORS.textMuted,
    fontFamily: monoFont,
  },
  modeBadge: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: VICE_COLORS.textMuted,
    fontFamily: monoFont,
  },
  modeGas: {
    color: VICE_COLORS.cyan,
  },
  modeBrake: {
    color: VICE_COLORS.pink,
  },
});
