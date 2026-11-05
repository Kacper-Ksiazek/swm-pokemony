import { StyleSheet } from "react-native";

export const skeletonImageStyles = StyleSheet.create({
  frame: {
    position: "relative",
  },

  skeleton: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#e8e8e8",
  },

  image: {},
});
