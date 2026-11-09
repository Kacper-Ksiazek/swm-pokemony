import { StyleSheet } from "react-native";

import { COLORS } from "@/shared/styles/colors";

export const skeletonImageStyles = StyleSheet.create({
  frame: {
    position: "relative",
  },

  skeleton: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.BORDER,
  },

  image: {},
});
