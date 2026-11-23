import { useWindowDimensions } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";

/** Road and side-panel sizes for landscape HUD columns flanking the track. */
export function useSensorsRoadLayout(insets: EdgeInsets) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const roadHeight = windowHeight;
  const roadWidth = Math.min(540, Math.max(280, windowWidth * 0.6));

  const leftEdgeSpace = (windowWidth - roadWidth) / 2 - Math.max(12, insets.left + 8) - 8;
  const rightEdgeSpace = (windowWidth - roadWidth) / 2 - Math.max(12, insets.right + 8) - 8;
  const leftPanelWidth = Math.max(135, leftEdgeSpace);
  const rightPanelWidth = Math.max(120, rightEdgeSpace);

  return {
    isLandscape: windowWidth > windowHeight,
    roadWidth,
    roadHeight,
    leftPanelWidth,
    rightPanelWidth,
  };
}
