import { Image, type ImageProps, type ImageSource } from "expo-image";
import { type ImageStyle, PixelRatio, type StyleProp } from "react-native";

export const DEFAULT_BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

export function displaySource(uri: string, widthPoints: number, heightPoints: number): ImageSource {
  const scale = PixelRatio.get();
  return {
    uri,
    width: Math.round(widthPoints * scale),
    height: Math.round(heightPoints * scale),
  };
}

export function FeedImage({ style, ...props }: ImageProps & { style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      placeholder={{ blurhash: DEFAULT_BLURHASH }}
      placeholderContentFit="cover"
      transition={200}
      contentFit="cover"
      {...props}
      style={style}
    />
  );
}
