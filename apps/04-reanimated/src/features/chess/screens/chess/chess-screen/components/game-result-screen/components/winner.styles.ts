import { StyleSheet } from "react-native";

export const winnerStyles = StyleSheet.create({
  ring: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
  },
  king: {
    width: 170,
    height: 170,
  },
  drawKings: {
    flexDirection: "row",
    alignItems: "center",
  },
  drawKing: {
    width: 96,
    height: 96,
  },
});
