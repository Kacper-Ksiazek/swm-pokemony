import { useState } from "react";
import { useWindowDimensions, type LayoutChangeEvent } from "react-native";

import { MAP_H, MAP_W } from "../constants/skia-map.constants";

export function useSkiaMapLayout() {
  const { width: winW, height: winH } = useWindowDimensions();
  const landscape = winW > winH;
  const [box, setBox] = useState({ w: winW, h: winH });
  const scale = Math.min(box.w / MAP_W, box.h / MAP_H);
  const width = MAP_W * scale;
  const mapHeight = MAP_H * scale;

  function onAreaLayout(e: LayoutChangeEvent) {
    setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  }

  return { box, landscape, scale, width, mapHeight, onAreaLayout };
}
