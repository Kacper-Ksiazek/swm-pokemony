import { SymbolView, type SymbolViewProps, type SymbolWeight } from "expo-symbols";
import type { StyleProp, ViewStyle } from "react-native";

import type { ExerciseIconName } from "./icon-symbol";

type SfSymbolName = Extract<SymbolViewProps["name"], string>;

const SF_SYMBOL_OVERRIDES = {
  "iphone.portrait": "iphone",
  "iphone.landscape": "iphone.landscape",
} as const satisfies Record<"iphone.portrait" | "iphone.landscape", SfSymbolName>;

function resolveSfSymbol(name: ExerciseIconName): SymbolViewProps["name"] {
  const override = SF_SYMBOL_OVERRIDES[name as keyof typeof SF_SYMBOL_OVERRIDES];
  if (override) {
    return override;
  }

  return name as SfSymbolName;
}

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
      name={resolveSfSymbol(name)}
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
