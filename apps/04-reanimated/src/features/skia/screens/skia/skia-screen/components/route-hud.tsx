import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import type { EdgeInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { ROUTE_HUD_BOTTOM_GAP, ROUTE_HUD_WIDTH } from "../constants/skia-map.constants";
import type { useSkiaRouteProgress } from "../hooks/use-skia-route-progress";

const OVERLAY_FG = "#FFFFFF";
const OVERLAY_FG_MUTED = "rgba(255, 255, 255, 0.72)";

const overlayChrome = {
  backgroundColor: "rgba(17, 17, 20, 0.88)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.22)",
  shadowColor: "#000",
  shadowOpacity: 0.28,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
};

type RouteHudProps = {
  insets: EdgeInsets;
  routeProgressFillStyle: ReturnType<typeof useSkiaRouteProgress>["routeProgressFillStyle"];
  onProgressTrackLayout: ReturnType<typeof useSkiaRouteProgress>["onProgressTrackLayout"];
};

export function RouteHud({ insets, routeProgressFillStyle, onProgressTrackLayout }: RouteHudProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.routeHudAnchor,
        { bottom: Math.max(ROUTE_HUD_BOTTOM_GAP, insets.bottom + ROUTE_HUD_BOTTOM_GAP) },
      ]}
    >
      <View style={styles.routeHud}>
        <View style={styles.routeBadgeRow}>
          <View style={styles.routeEndpoint}>
            <View style={[styles.routeDot, styles.routeDotStart]} />
            <Text style={styles.routeCity}>Kraków</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={OVERLAY_FG_MUTED} />
          <View style={styles.routeEndpoint}>
            <View style={[styles.routeDot, styles.routeDotEnd]} />
            <Text style={styles.routeCity}>Wadowice</Text>
          </View>
        </View>
        <Text style={styles.routeCaption}>Wizualizacja trasy na mapie</Text>
        <View style={styles.progressTrack} onLayout={onProgressTrackLayout}>
          <Animated.View style={[styles.progressFill, routeProgressFillStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  routeHudAnchor: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  routeHud: {
    width: ROUTE_HUD_WIDTH,
    maxWidth: "100%",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    ...overlayChrome,
  },
  routeBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  routeEndpoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeDotStart: { backgroundColor: theme.colors.accent },
  routeDotEnd: { backgroundColor: theme.colors.accentStrong },
  routeCity: {
    fontSize: 16,
    fontWeight: "700",
    color: OVERLAY_FG,
    letterSpacing: 0.15,
  },
  routeCaption: {
    fontSize: 13,
    fontWeight: "600",
    color: OVERLAY_FG_MUTED,
    textAlign: "center",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
});
