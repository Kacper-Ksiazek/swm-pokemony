import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePressIn = () => {
    scale.set(withSpring(0.88, { damping: 18, stiffness: 420 }));
  };

  const handlePress = () => {
    const markingFavorite = !isFavorite;
    onToggleFavorite();

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
      style={[styles.favoriteButton, animatedStyle]}
    >
      <SymbolView
        name={{
          ios: isFavorite ? "heart.fill" : "heart",
          android: isFavorite ? "favorite" : "favorite_border",
          web: isFavorite ? "favorite" : "favorite_border",
        }}
        size={32}
        tintColor={isFavorite ? COLORS.PRIMARY : "#999999"}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    padding: 8,
  },
});
