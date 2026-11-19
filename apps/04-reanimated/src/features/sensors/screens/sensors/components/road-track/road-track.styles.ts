import { StyleSheet } from "react-native";

import { theme } from "@/components/theme";

export const styles = StyleSheet.create({
  road: {
    backgroundColor: "#1D1F27",
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#2E3240",
  },
  curbStripe: {
    position: "absolute",
    width: 8,
  },
  curbLeft: {
    left: 0,
  },
  curbRight: {
    right: 0,
  },

  laneDash: {
    position: "absolute",
    width: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.36)",
  },
  speedStreak: {
    position: "absolute",
    width: 2,
    height: 36,
    borderRadius: 1,
    backgroundColor: "#E2E8F0",
  },
  speedStreakLeft: {
    left: 16,
  },
  speedStreakRight: {
    right: 16,
  },

  carBody: {
    position: "absolute",
    top: 0,
    left: 0,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  playerCar: {
    backgroundColor: theme.colors.accent,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  racingStripe: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  headlights: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  headlight: {
    width: 5,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FEF08A",
  },
  playerWindshield: {
    width: "76%",
    height: "24%",
    borderRadius: 4,
    backgroundColor: "#0F172A",
    marginTop: 2,
  },
  playerRearWindow: {
    width: "68%",
    height: "15%",
    borderRadius: 3,
    backgroundColor: "#1E293B",
  },

  rivalWindshield: {
    width: "74%",
    height: "18%",
    borderRadius: 3,
    backgroundColor: "#0F172A",
    marginTop: 2,
  },
  rivalRearWindow: {
    width: "68%",
    height: "14%",
    borderRadius: 3,
    backgroundColor: "#1E293B",
  },
  busRoofVent: {
    width: "52%",
    height: "24%",
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  motoHelmet: {
    position: "absolute",
    top: "34%",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#0F172A",
  },
  rivalTaillights: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  taillight: {
    width: 5,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#EF4444",
  },

  hitFlashOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#EF4444",
  },
});
