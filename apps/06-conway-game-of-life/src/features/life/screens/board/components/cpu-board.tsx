import { useCallback, type RefObject } from "react";
import { PixelRatio, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { zoomToCellSize, type BoardCamera, type Viewport } from "../hooks/board-camera";
import { type CpuField } from "../hooks/use-cpu-life";

type CpuBoardProps = {
  cameraRef: RefObject<BoardCamera>;
  viewportRef: RefObject<Viewport>;
  field: CpuField;
};

/** Living cells are views in cell units. The layer scale maps one cell onto the same points the GPU camera uses. */
export function CpuBoard({ cameraRef, viewportRef, field }: CpuBoardProps) {
  const layerStyle = useAnimatedStyle(() => {
    const span = field.spanX.get();
    const cell = span > 0 ? field.pointsWidth.get() / span : 0;

    return {
      transformOrigin: "left top",
      transform: [
        { translateX: -field.originX.get() * cell },
        { translateY: -field.originY.get() * cell },
        { scale: cell },
      ],
    };
  });

  const onLayout = useCallback(
    (width: number, height: number) => {
      const ratio = PixelRatio.get();
      const firstLayout = viewportRef.current.pixelsWidth === 0;
      viewportRef.current = {
        pointsWidth: width,
        pointsHeight: height,
        pixelsWidth: width * ratio,
        pixelsHeight: height * ratio,
      };

      if (firstLayout) {
        zoomToCellSize(cameraRef.current, viewportRef.current);
      }
    },
    [cameraRef, viewportRef],
  );

  return (
    <View
      style={styles.board}
      onLayout={(event) => {
        onLayout(event.nativeEvent.layout.width, event.nativeEvent.layout.height);
      }}
    >
      <Animated.View style={[styles.layer, layerStyle]}>
        {field.places.map((place) => (
          <View
            key={`${place.x}-${place.y}`}
            style={[
              styles.cell,
              { left: place.x, top: place.y, width: field.stride, height: field.stride },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#0F1214",
  },
  layer: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  cell: {
    position: "absolute",
    backgroundColor: "#9EED73",
  },
});
