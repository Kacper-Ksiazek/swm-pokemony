import { StyleSheet } from "react-native";
import Animated, { SharedTransition, useAnimatedStyle } from "react-native-reanimated";
import type { ImageProps } from "expo-image";

import { AnimatedExpoImage } from "@/components/animated-expo-image";
import { theme } from "@/components/theme";

import type { PokemonLocation } from "../data";

const SHARED_TRANSITION_MS = 450;

const LOCATION_TRANSITION = SharedTransition.duration(SHARED_TRANSITION_MS).fadeContent();

/** SET interpolates `transform`; keep one `fontSize` and scale (Reanimated SET docs). */
const TITLE_FONT_SIZE = 18;
const TITLE_DETAIL_SCALE = 26 / TITLE_FONT_SIZE;

const SUBTITLE_FONT_SIZE = 13;
const SUBTITLE_LINE_HEIGHT = 18;
const SUBTITLE_DETAIL_SCALE = 15 / SUBTITLE_FONT_SIZE;

type LocationElementProps = {
  location: PokemonLocation;
};

type LocationSharedImageProps = LocationElementProps & {
  variant: "card" | "hero" | "compact";
  onLoadStart?: ImageProps["onLoadStart"];
  onLoadEnd?: ImageProps["onLoadEnd"];
};

export function LocationSharedImage({
  location,
  variant,
  onLoadStart,
  onLoadEnd,
}: LocationSharedImageProps) {
  const animatedStyle = useAnimatedStyle(
    () => ({
      width: "100%",
      height: variant === "hero" ? 320 : variant === "card" ? 200 : "100%",
    }),
    [variant],
  );

  return (
    <AnimatedExpoImage
      sharedTransitionTag={location.id}
      sharedTransitionStyle={LOCATION_TRANSITION}
      source={location.image}
      style={animatedStyle}
      contentFit="cover"
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
    />
  );
}

export function LocationSharedRegionPill({ location }: LocationElementProps) {
  return (
    <Animated.View
      sharedTransitionTag={`${location.id}-region`}
      sharedTransitionStyle={LOCATION_TRANSITION}
      style={styles.regionPill}
    >
      <Animated.Text
        style={styles.regionText}
        sharedTransitionTag={`${location.id}-region-text`}
        sharedTransitionStyle={LOCATION_TRANSITION}
      >
        {location.region}
      </Animated.Text>
    </Animated.View>
  );
}

type LocationSharedTextProps = LocationElementProps & {
  variant: "card" | "detail";
};

export function LocationSharedTitle({ location, variant }: LocationSharedTextProps) {
  const isCard = variant === "card";

  return (
    <Animated.Text
      sharedTransitionTag={`${location.id}-title`}
      sharedTransitionStyle={LOCATION_TRANSITION}
      style={[styles.titleText, isCard ? styles.titleCard : styles.titleDetail]}
    >
      {location.name}
    </Animated.Text>
  );
}

export function LocationSharedSubtitle({ location, variant }: LocationSharedTextProps) {
  const isCard = variant === "card";

  return (
    <Animated.Text
      sharedTransitionTag={`${location.id}-subtitle`}
      sharedTransitionStyle={LOCATION_TRANSITION}
      style={[styles.subtitleText, isCard ? styles.subtitleCard : styles.subtitleDetail]}
    >
      {location.subtitle}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: "700",
    color: theme.colors.textHeading,
    transformOrigin: "left center",
    transitionProperty: ["transform", "color"],
    transitionDuration: SHARED_TRANSITION_MS,
  },
  titleCard: {
    transform: [{ scale: 1 }],
  },
  titleDetail: {
    transform: [{ scale: TITLE_DETAIL_SCALE }],
  },
  subtitleText: {
    fontSize: SUBTITLE_FONT_SIZE,
    lineHeight: SUBTITLE_LINE_HEIGHT,
    color: theme.colors.textSecondary,
    transformOrigin: "left center",
    transitionProperty: ["transform", "color"],
    transitionDuration: SHARED_TRANSITION_MS,
  },
  subtitleCard: {
    transform: [{ scale: 1 }],
  },
  subtitleDetail: {
    transform: [{ scale: SUBTITLE_DETAIL_SCALE }],
  },
  regionPill: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  regionText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.pillText,
  },
});
