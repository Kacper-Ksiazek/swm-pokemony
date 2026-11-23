import { StyleSheet } from "react-native";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import { VICE_COLORS } from "../../constants";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: VICE_COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: VICE_COLORS.cardBorderCyan,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 6,
    shadowColor: VICE_COLORS.cyan,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: VICE_COLORS.cyan,
    fontFamily: monoFont,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: "900",
    color: VICE_COLORS.gold,
    fontFamily: monoFont,
    fontVariant: ["tabular-nums"],
  },
  comboBadge: {
    backgroundColor: "rgba(255, 46, 147, 0.22)",
    borderWidth: 1,
    borderColor: VICE_COLORS.pink,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  comboText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: VICE_COLORS.pink,
    fontFamily: monoFont,
  },
  heartsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 2,
  },
});
