import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { COLORS, RADIUS } from "@/shared/styles/colors";

import { POKEMON_LIST_ITEM_HEIGHT, POKEMON_LIST_SPRITE_SIZE } from "../constants";

const SKELETON_ROW_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function PokemonListSkeleton() {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 1 : 0.45);

  useEffect(() => {
    if (reducedMotion) {
      opacity.set(1);
      return;
    }

    opacity.set(withRepeat(withTiming(1, { duration: 700 }), -1, true));
  }, [opacity, reducedMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.list}>
      <Animated.View style={pulseStyle}>
        {SKELETON_ROW_KEYS.map((key) => (
          <View key={key} style={styles.row}>
            <View style={styles.sprite} />
            <View style={styles.lines}>
              <View style={styles.name} />
              <View style={styles.id} />
            </View>
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  row: {
    height: POKEMON_LIST_ITEM_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.BORDER,
  },
  sprite: {
    width: POKEMON_LIST_SPRITE_SIZE,
    height: POKEMON_LIST_SPRITE_SIZE,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.BORDER,
  },
  lines: {
    flex: 1,
    gap: 8,
  },
  name: {
    height: 14,
    width: "46%",
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.BORDER,
  },
  id: {
    height: 12,
    width: "24%",
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.BORDER,
  },
});
