import { Image, type ImageContentFit } from "expo-image";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { createSkeletonImageStyles } from "./skeleton-image.styles";

type SkeletonImageProps = {
  uri: string;
  loadKey: string | number;
  size?: number;
  skeletonBorderRadius?: number;
  contentFit?: ImageContentFit;
  transition?: number;
};

export function SkeletonImage({
  uri,
  loadKey,
  size = 72,
  skeletonBorderRadius = 12,
  contentFit = "contain",
  transition = 200,
}: SkeletonImageProps) {
  const [loadedKey, setLoadedKey] = useState<string | number | null>(null);
  const isLoading = loadedKey !== loadKey;

  const styles = useMemo(
    () => createSkeletonImageStyles(size, skeletonBorderRadius),
    [size, skeletonBorderRadius],
  );

  return (
    <View style={styles.frame}>
      {isLoading ? <View style={styles.skeleton} /> : null}

      <Image
        source={{ uri }}
        recyclingKey={String(loadKey)}
        style={styles.image}
        contentFit={contentFit}
        transition={transition}
        onLoad={() => {
          setLoadedKey(loadKey);
        }}
        onError={() => {
          setLoadedKey(loadKey);
        }}
      />
    </View>
  );
}
