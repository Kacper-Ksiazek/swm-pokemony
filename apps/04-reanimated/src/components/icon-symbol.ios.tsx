import { SymbolView, type SymbolWeight } from "expo-symbols";
import type { StyleProp, ViewStyle } from "react-native";

import type { ExerciseIconName } from "./icon-symbol";

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = "regular",
}: {
  name: ExerciseIconName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}

export type { ExerciseIconName } from "./icon-symbol";
