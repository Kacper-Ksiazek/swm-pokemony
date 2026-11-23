import { StyleSheet } from "react-native";

import { theme } from "@/components/theme";

import { VICE_COLORS } from "../../constants";

export const styles = StyleSheet.create({
  road: {
    backgroundColor: VICE_COLORS.roadBg,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: VICE_COLORS.roadBorder,
    shadowColor: VICE_COLORS.pink,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
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
    backgroundColor: VICE_COLORS.laneDash,
  },
  speedStreak: {
    position: "absolute",
    width: 2.5,
    height: 42,
    borderRadius: 2,
  },
  speedStreakLeft: {
    left: 16,
    backgroundColor: VICE_COLORS.cyan,
  },
  speedStreakRight: {
    right: 16,
    backgroundColor: VICE_COLORS.pink,
  },

  spriteContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playerUnderglow: {
    position: "absolute",
    top: -4,
    right: -4,
    bottom: -4,
    left: -4,
    borderRadius: 18,
    backgroundColor: "rgba(0, 240, 255, 0.24)",
    shadowColor: VICE_COLORS.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  nitroFlamesRow: {
    position: "absolute",
    bottom: -14,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  nitroFlame: {
    width: 6,
    height: 16,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: VICE_COLORS.cyan,
    shadowColor: VICE_COLORS.pink,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  trafficLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  hitFlashOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: VICE_COLORS.pink,
  },
});
