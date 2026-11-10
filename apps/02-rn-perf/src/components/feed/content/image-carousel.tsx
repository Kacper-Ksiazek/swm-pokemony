import { useContext } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { ColorsContext } from "@/context/colors-context";
import type { FeedImage } from "@/data/mock-feed";
import { CarouselImage } from "./carousel-image";

const IMAGE_WIDTH = 400;

function CarouselDot({
  index,
  scrollX,
  activeColor,
  inactiveColor,
}: {
  index: number;
  scrollX: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
}) {
  const style = useAnimatedStyle(() => {
    const active = Math.round(scrollX.get() / IMAGE_WIDTH) === index;
    return {
      width: active ? 8 : 6,
      height: active ? 8 : 6,
      borderRadius: active ? 4 : 3,
      backgroundColor: active ? activeColor : inactiveColor,
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

export const ImageCarousel = ({
  images,
  onImagePress,
}: {
  images: FeedImage[];
  onImagePress?: () => void;
}) => {
  const colors = useContext(ColorsContext);
  const scrollX = useSharedValue(0);
  const inactiveColor = `${colors.icon}40`;

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollX.set(event.contentOffset.x);
  });

  return (
    <View>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
      >
        {images.map((image) => (
          <Pressable key={image.uri} onPress={onImagePress}>
            <CarouselImage image={image} />
          </Pressable>
        ))}
      </Animated.ScrollView>

      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((image, index) => (
            <CarouselDot
              key={`dot-${image.uri}`}
              index={index}
              scrollX={scrollX}
              activeColor={colors.tint}
              inactiveColor={inactiveColor}
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
});
