import { StyleSheet } from "react-native";

import { COLORS, SPACING, TYPE_SIZE } from "@/shared/styles/colors";

export const emptyStateStyles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT,
    textAlign: "center",
  },
  helperText: {
    fontSize: 15,
    color: COLORS.TEXT_MUTED,
    textAlign: "center",
  },
  link: {
    marginTop: SPACING.sm,
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    color: COLORS.PRIMARY,
  },
});
