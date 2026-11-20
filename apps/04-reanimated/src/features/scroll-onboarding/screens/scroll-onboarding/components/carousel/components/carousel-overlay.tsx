import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { OnboardingSlide } from "../../../scroll-onboarding-data";
import { AnimatedCaption } from "./animated-caption";
import { StepperPill } from "./stepper-pill";

const FIXED_CONTAINER_HEIGHT = 400;

type CarouselOverlayProps = {
  slides: readonly OnboardingSlide[];
  windowWidth: number;
  scrollProgress: SharedValue<number>;
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  onReturnHome: () => void;
};

export const CarouselOverlay = ({
  slides,
  windowWidth,
  scrollProgress,
  currentSlide,
  onSelectSlide,
  onReturnHome,
}: CarouselOverlayProps) => {
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.get() }],
  }));

  return (
    <View style={styles.wrapper}>
      <Svg
        pointerEvents="none"
        width={windowWidth}
        height={FIXED_CONTAINER_HEIGHT}
        style={styles.fade}
      >
        <Defs>
          <LinearGradient id="fixedContainerFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#000000" stopOpacity={0} />
            <Stop offset="50%" stopColor="#000000" stopOpacity={1} />
          </LinearGradient>
        </Defs>

        <Rect width={windowWidth} height={FIXED_CONTAINER_HEIGHT} fill="url(#fixedContainerFade)" />
      </Svg>

      <View style={styles.captionSlot}>
        {slides.map((slide, index) => (
          <AnimatedCaption
            key={slide.id}
            caption={slide.caption}
            index={index}
            scrollProgress={scrollProgress}
          />
        ))}
      </View>

      <View style={styles.stepperWrapper}>
        {slides.map((slide, index) => (
          <StepperPill
            key={slide.id}
            index={index}
            scrollProgress={scrollProgress}
            onPress={onSelectSlide}
          />
        ))}
      </View>

      <View style={styles.buttonsWrapper}>
        <Pressable
          onPress={onReturnHome}
          onPressIn={() => buttonScale.set(withSpring(0.95, { damping: 18, stiffness: 320 }))}
          onPressOut={() => buttonScale.set(withSpring(1, { damping: 18, stiffness: 320 }))}
          accessibilityRole="button"
          accessibilityState={{ selected: currentSlide >= 0 }}
        >
          <Animated.View style={[styles.returnHomeButton, buttonAnimatedStyle]}>
            <Text style={styles.returnHomeButtonText}>Return Home</Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: FIXED_CONTAINER_HEIGHT,
    justifyContent: "flex-end",
    gap: 24,
    paddingBottom: 48,
  },

  fade: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  stepperWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  captionSlot: {
    height: 84,
    justifyContent: "center",
  },

  returnHomeButton: {
    backgroundColor: "#2e2e2e",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#3a3a3c",
  },

  returnHomeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  buttonsWrapper: {
    gap: 8,
    paddingHorizontal: 24,
  },
});
