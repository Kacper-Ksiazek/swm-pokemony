import { useContext, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ColorsContext } from "@/context/colors-context";
import type { FeedImage } from "@/data/mock-feed";
import { CarouselImage } from "./carousel-image";

const IMAGE_WIDTH = 400;

export const ImageCarousel = ({
  images,
  onImagePress,
}: {
  images: FeedImage[];
  onImagePress?: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const colors = useContext(ColorsContext);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / IMAGE_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image) => (
          <Pressable key={image.uri} onPress={onImagePress}>
            <CarouselImage image={image} />
          </Pressable>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((image, index) => (
            <View
              key={`dot-${image.uri}`}
              style={[
                styles.dot,
                index === activeIndex
                  ? [styles.dotActive, { backgroundColor: colors.tint }]
                  : { backgroundColor: colors.icon + "40" },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
