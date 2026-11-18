import { StyleSheet, View, type ImageSourcePropType } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

type PhoneFrameProps = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  index: number;
  scrollProgress: SharedValue<number>;
};

const BEZEL_WIDTH = 12;

export const PhoneFrame = ({ source, width, height, index, scrollProgress }: PhoneFrameProps) => {
  const outerRadius = width * 0.16;
  const screenRadius = Math.max(outerRadius - BEZEL_WIDTH, 0);

  const shellAnimatedStyle = useAnimatedStyle(() => {
    const offset = scrollProgress.get() - index;
    const absOffset = Math.abs(offset);

    const scale = interpolate(absOffset, [0, 1], [1, 0.86], Extrapolation.CLAMP);
    const translateY = interpolate(absOffset, [0, 1], [64, 96], Extrapolation.CLAMP);
    const rotateY = interpolate(offset, [-1, 0, 1], [-14, 0, 14], Extrapolation.CLAMP);
    const rotateZ = interpolate(offset, [-1, 0, 1], [2.5, 0, -2.5], Extrapolation.CLAMP);
    const opacity = interpolate(absOffset, [0, 0.85, 1.2], [1, 0.72, 0.45], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [
        { perspective: 1000 },
        { translateY },
        { scale },
        { rotateY: `${rotateY}deg` },
        { rotateZ: `${rotateZ}deg` },
      ],
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const offset = scrollProgress.get() - index;
    const absOffset = Math.abs(offset);
    const translateX = interpolate(offset, [-1, 0, 1], [-26, 0, 26], Extrapolation.CLAMP);
    const opacity = interpolate(absOffset, [0, 0.55], [1, 0], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ scale: 1.08 }, { translateX }],
    };
  });

  return (
    <Animated.View style={[styles.shell, { width, height }, shellAnimatedStyle]}>
      <View style={[styles.bezel, { borderRadius: outerRadius }]}>
        <View style={[styles.screen, { borderRadius: screenRadius }]}>
          <Animated.Image
            source={source}
            style={[styles.image, imageAnimatedStyle]}
            resizeMode="cover"
          />
          <View style={styles.island} />
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shell: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },

  bezel: {
    flex: 1,
    padding: BEZEL_WIDTH,
    backgroundColor: "#1C1C1E",
  },

  screen: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#000000",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  island: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    width: "34%",
    height: 28,
    borderRadius: 16,
    backgroundColor: "#000000",
  },

  homeIndicator: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    width: "34%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
});
