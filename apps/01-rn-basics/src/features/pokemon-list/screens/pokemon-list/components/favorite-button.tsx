import { SymbolView } from "expo-symbols";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "@/shared/styles/colors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FavoriteButtonProps = {
  isFavorite: boolean;
  favoriteLabel: string;
  onToggleFavorite: () => void;
};

export function FavoriteButton({
  isFavorite,
  favoriteLabel,
  onToggleFavorite,
}: FavoriteButtonProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const tintProgress = useSharedValue(isFavorite ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      tintProgress.set(isFavorite ? 1 : 0);
      return;
    }

    tintProgress.set(
      withTiming(isFavorite ? 1 : 0, {
        duration: 340,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [isFavorite, reducedMotion, tintProgress]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const outlineStyle = useAnimatedStyle(() => ({
    opacity: 1 - tintProgress.get(),
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: tintProgress.get(),
  }));

  const handlePressIn = () => {
    if (reducedMotion) {
      return;
    }

    scale.set(withSpring(0.88, { damping: 18, stiffness: 420 }));
  };

  const handlePress = () => {
    const markingFavorite = !isFavorite;
    onToggleFavorite();

    if (reducedMotion) {
      return;
    }

    if (markingFavorite) {
      scale.set(
        withSequence(
          withSpring(0.82, { damping: 18, stiffness: 420 }),
          withSpring(1.32, { damping: 7, stiffness: 320 }),
          withSpring(1, { damping: 14, stiffness: 220 }),
        ),
      );
      return;
    }

    scale.set(
      withSequence(
        withSpring(0.9, { damping: 18, stiffness: 420 }),
        withSpring(1, { damping: 14, stiffness: 220 }),
      ),
    );
  };

  const handlePressOut = () => {
    if (reducedMotion) {
      return;
    }

    scale.set(withSpring(1, { damping: 14, stiffness: 220 }));
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={favoriteLabel}
      hitSlop={8}
      style={[styles.favoriteButton, scaleStyle]}
    >
      <Animated.View style={outlineStyle}>
        <SymbolView
          name={{ ios: "heart", android: "favorite_border", web: "favorite_border" }}
          size={32}
          tintColor={COLORS.TEXT_MUTED}
        />
      </Animated.View>
      <Animated.View style={[styles.fillHeart, fillStyle]}>
        <SymbolView
          name={{ ios: "heart.fill", android: "favorite", web: "favorite" }}
          size={32}
          tintColor={COLORS.PRIMARY}
        />
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    padding: 8,
  },
  fillHeart: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
