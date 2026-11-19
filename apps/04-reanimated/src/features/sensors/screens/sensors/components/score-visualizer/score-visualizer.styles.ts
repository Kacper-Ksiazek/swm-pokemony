import { StyleSheet } from "react-native";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    fontFamily: monoFont,
    fontVariant: ["tabular-nums"],
  },
  heartsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
