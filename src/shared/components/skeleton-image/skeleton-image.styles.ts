import { StyleSheet } from "react-native";

export function createSkeletonImageStyles(size: number, skeletonBorderRadius: number) {
  return StyleSheet.create({
    frame: {
      width: size,
      height: size,
      position: "relative",
    },

    skeleton: {
      ...StyleSheet.absoluteFill,
      borderRadius: skeletonBorderRadius,
      backgroundColor: "#e8e8e8",
    },

    image: {
      width: size,
      height: size,
    },
  });
}
