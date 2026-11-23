import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolWeight } from "expo-symbols";
import type { ComponentProps } from "react";
import type { ColorValue, StyleProp, TextStyle } from "react-native";

import { theme } from "./theme";

const MAPPING = {
  "star.fill": "star",
  "circle.fill": "circle",
  "cube.fill": "view-in-ar",
  "basketball.fill": "sports-basketball",
  "keyboard.fill": "keyboard",
  "arrow.up.arrow.down": "swap-vert",
  "arrow.counterclockwise": "refresh",
  "sensor.tag.radiowaves.forward.fill": "sensors",
  "square.on.square": "layers",
  "paintbrush.pointed.fill": "brush",
  "square.grid.3x3.fill": "grid-on",
  magnifyingglass: "search",
  "chevron.down": "expand-more",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  scope: "my-location",
  xmark: "close",
  checkmark: "check",
  "house.fill": "home",
  "iphone.portrait": "stay-current-portrait",
  "iphone.landscape": "stay-current-landscape",
} as const satisfies Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

export type ExerciseIconName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: ExerciseIconName;
  size?: number;
  color: ColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const resolvedColor = typeof color === "string" ? color : theme.colors.accent;

  return <MaterialIcons color={resolvedColor} size={size} name={MAPPING[name]} style={style} />;
}
