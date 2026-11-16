import type { StyleProp, TextStyle } from "react-native";
import { Text } from "react-native";

import { getIcomoonGlyph, ICOMOON_FONT_FAMILY } from "../../shared";

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function Icon({ name, size = 24, color = "#111111", style }: IconProps) {
  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontFamily: ICOMOON_FONT_FAMILY,
          fontSize: size,
          lineHeight: size,
          color,
        },
        style,
      ]}
    >
      {getIcomoonGlyph(name)}
    </Text>
  );
}
