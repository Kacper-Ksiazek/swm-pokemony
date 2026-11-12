import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type WebViewLabFrameProps = {
  packageName: string;
  badge: string;
  tone: "reference" | "solution";
  isLoading: boolean;
  loadedUrl: string | null;
  children: ReactNode;
};

export function WebViewLabFrame({
  packageName,
  badge,
  tone,
  isLoading,
  loadedUrl,
  children,
}: WebViewLabFrameProps) {
  return (
    <View style={styles.frame}>
      <Text style={styles.packageName}>{packageName}</Text>
      <Text
        style={[styles.badge, tone === "reference" ? styles.badgeReference : styles.badgeSolution]}
      >
        {badge}
      </Text>

      <View style={styles.viewport}>{children}</View>

      <Text style={styles.status} numberOfLines={2}>
        {isLoading ? "Czekam na onLoad…" : loadedUrl}
      </Text>
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
  status: {
    fontSize: 13,
    color: "#666666",
    minHeight: 18,
  },
});
