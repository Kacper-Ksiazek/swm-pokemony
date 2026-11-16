import { Activity, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type WebViewLabFrameProps = {
  isLoading: boolean;
  loadedUrl: string | null;
  children: ReactNode;
};

export function WebViewLabFrame({ isLoading, loadedUrl, children }: WebViewLabFrameProps) {
  return (
    <View style={styles.frame}>
      <View style={styles.viewport}>
        <View style={styles.viewportStack}>
          <Activity mode={isLoading ? "visible" : "hidden"}>
            <View style={styles.spinnerOverlay} pointerEvents="none">
              <ActivityIndicator size="large" />
            </View>
          </Activity>

          <Activity mode="visible">
            <View style={[styles.webSlot, isLoading && styles.webSlotWhileLoading]}>
              {children}
            </View>
          </Activity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    width: "100%",
    gap: 8,
    minHeight: 0,
  },
  packageName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    fontFamily: "Menlo",
  },
  badge: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  badgeReference: {
    color: "#0d74ce",
    backgroundColor: "#e8f4fc",
  },
  badgeSolution: {
    color: "#2d6a4f",
    backgroundColor: "#eaf4ee",
  },
  viewport: {
    flex: 1,
    minHeight: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  viewportStack: {
    flex: 1,
    minHeight: 0,
    position: "relative",
  },
  webSlot: {
    flex: 1,
    minHeight: 0,
  },
  webSlotWhileLoading: {
    opacity: 0,
  },
  status: {
    fontSize: 13,
    color: "#666666",
    minHeight: 18,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
