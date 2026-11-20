import { useEffect, useState } from "react";
import { usePanGesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const SWIPE_THRESHOLD_RATIO = 0.25;
const VELOCITY_THRESHOLD = 450;

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 220,
  mass: 0.9,
} as const;

/** Clamps a slide index to the valid `[0, slideCount - 1]` range on the UI thread. */
function clampSlideIndex(index: number, slideCount: number) {
  "worklet";

  return Math.min(slideCount - 1, Math.max(0, index));
}

export function useCarouselPager(slideCount: number, windowWidth: number) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const translateX = useSharedValue(0);
  const dragStartX = useSharedValue(0);
  const lastVelocityX = useSharedValue(0);

  const slideIndex = useSharedValue(0);
  const screenWidth = useSharedValue(windowWidth);

  const scrollProgress = useDerivedValue(() => {
    const width = screenWidth.get();

    return width > 0 ? -translateX.get() / width : 0;
  });

  useEffect(() => {
    screenWidth.set(windowWidth);
    translateX.set(-slideIndex.get() * windowWidth);
  }, [screenWidth, slideIndex, translateX, windowWidth]);

  const goToSlide = (index: number) => {
    cancelAnimation(translateX);
    slideIndex.set(index);
    translateX.set(withSpring(-index * windowWidth, SPRING_CONFIG));
    setCurrentSlide(index);
  };

  const panGesture = usePanGesture({
    activeOffsetX: [-12, 12],
    failOffsetY: [-16, 16],
    onBegin: () => {
      cancelAnimation(translateX);
      dragStartX.set(translateX.get());
      lastVelocityX.set(0);
    },
    onUpdate: (event) => {
      const width = screenWidth.get();
      const minX = -(slideCount - 1) * width;
      const rawNextX = dragStartX.get() + event.translationX;

      lastVelocityX.set(event.velocityX);

      if (rawNextX > 0) {
        translateX.set(rawNextX * 0.28);
      } else if (rawNextX < minX) {
        translateX.set(minX + (rawNextX - minX) * 0.28);
      } else {
        translateX.set(rawNextX);
      }
    },
    onFinalize: () => {
      const width = screenWidth.get();
      const current = slideIndex.get();
      const velocityX = lastVelocityX.get();
      const dx = translateX.get() + current * width;

      const passedDistance = Math.abs(dx) >= width * SWIPE_THRESHOLD_RATIO;
      const passedVelocity = Math.abs(velocityX) >= VELOCITY_THRESHOLD;

      // Fast flicks with minimal drag distance should follow velocity rather than position.
      const useVelocityDirection = passedVelocity && Math.abs(dx) < width * 0.1;
      const direction = useVelocityDirection ? (velocityX < 0 ? 1 : -1) : dx < 0 ? 1 : -1;
      const next =
        passedDistance || passedVelocity
          ? clampSlideIndex(current + direction, slideCount)
          : current;

      slideIndex.set(next);
      translateX.set(withSpring(-next * width, SPRING_CONFIG));
      scheduleOnRN(setCurrentSlide, next);
    },
  });

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }));

  return {
    currentSlide,
    scrollProgress,
    panGesture,
    trackAnimatedStyle,
    goToSlide,
  };
}
