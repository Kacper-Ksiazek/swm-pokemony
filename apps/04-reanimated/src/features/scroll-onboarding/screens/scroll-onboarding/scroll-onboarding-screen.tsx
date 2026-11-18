import { StyleSheet, useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { router } from "expo-router";

import { CarouselBackdrop } from "./components/carousel/components/carousel-backdrop";
import { CarouselOverlay } from "./components/carousel/components/carousel-overlay";
import { IntroSlide } from "./components/carousel/components/intro-slide";
import { useCarouselPager } from "./components/carousel/hooks/use-carousel-pager";
import { PhoneFrame } from "./components/phone-frame";
import { ONBOARDING_ASSETS, ONBOARDING_SLIDES } from "./scroll-onboarding-data";

const SLIDE_COUNT = ONBOARDING_SLIDES.length;
const CAPTION_RESERVE = 160;
const PHONE_ASPECT = 393 / 852;

export function ScrollOnboardingScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const slideWidth = windowWidth;
  const trackWidth = slideWidth * SLIDE_COUNT;

  const availableHeight = Math.max(windowHeight - CAPTION_RESERVE, 0);
  const availableWidth = windowWidth - 24;
  const phoneWidth = Math.min(availableWidth, availableHeight * PHONE_ASPECT);
  const phoneHeight = phoneWidth / PHONE_ASPECT;

  const { currentSlide, scrollProgress, panGesture, trackAnimatedStyle, goToSlide } =
    useCarouselPager(SLIDE_COUNT, windowWidth);

  function returnHome() {
    router.push("/");
  }

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <CarouselBackdrop scrollProgress={scrollProgress} slideCount={SLIDE_COUNT} />
        <View style={styles.viewport}>
          <View style={styles.gestureSurface}>
            <Animated.View style={[styles.track, { width: trackWidth }, trackAnimatedStyle]}>
              {ONBOARDING_SLIDES.map((slide, index) =>
                slide.variant === "intro" ? (
                  <View key={slide.id} style={[styles.introSlide, { width: slideWidth }]}>
                    <IntroSlide
                      source={ONBOARDING_ASSETS[slide.assetId].source}
                      index={index}
                      scrollProgress={scrollProgress}
                    />
                  </View>
                ) : (
                  <View key={slide.id} style={[styles.slide, { width: slideWidth }]}>
                    <PhoneFrame
                      source={ONBOARDING_ASSETS[slide.assetId].source}
                      width={phoneWidth}
                      height={phoneHeight}
                      index={index}
                      scrollProgress={scrollProgress}
                    />
                  </View>
                ),
              )}
            </Animated.View>
          </View>

          <CarouselOverlay
            slides={ONBOARDING_SLIDES}
            windowWidth={windowWidth}
            scrollProgress={scrollProgress}
            currentSlide={currentSlide}
            onSelectSlide={goToSlide}
            onReturnHome={returnHome}
          />
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  viewport: {
    flex: 1,
    overflow: "hidden",
  },

  gestureSurface: {
    flex: 1,
  },

  track: {
    flexDirection: "row",
    height: "100%",
  },

  slide: {
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: CAPTION_RESERVE,
  },

  introSlide: {
    height: "100%",
    overflow: "hidden",
  },
});
