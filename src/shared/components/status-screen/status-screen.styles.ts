import { StyleSheet } from "react-native";

export const statusScreenStyles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  helperText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e3350d",
  },
  retryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export const defaultStatusAccentColor = "#e3350d";
