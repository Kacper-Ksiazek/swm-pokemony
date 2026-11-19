import { StyleSheet } from "react-native";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import { GAUGE_SIZE } from "./speed-visualizer.constants";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
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
    color: theme.colors.textPrimary,
    fontFamily: monoFont,
    fontVariant: ["tabular-nums"],
    lineHeight: 24,
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    fontFamily: monoFont,
  },
  modeBadge: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    fontFamily: monoFont,
  },
  modeGas: {
    color: theme.colors.success,
  },
  modeBrake: {
    color: theme.colors.accent,
  },
});
