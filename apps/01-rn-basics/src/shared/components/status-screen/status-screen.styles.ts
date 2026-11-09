import { StyleSheet } from "react-native";

import { COLORS, SPACING, TYPE_SIZE } from "@/shared/styles/colors";

export const statusScreenStyles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.BACKGROUND,
    gap: SPACING.md,
  },
  helperText: {
    fontSize: 15,
    color: COLORS.TEXT_MUTED,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT,
    textAlign: "center",
  },
  devDetail: {
    fontSize: TYPE_SIZE.caption,
    color: COLORS.TEXT_MUTED,
    textAlign: "center",
  },
  compact: {
    flex: 0,
    paddingVertical: SPACING.xl,
  },
});

export const defaultStatusAccentColor = COLORS.PRIMARY;
