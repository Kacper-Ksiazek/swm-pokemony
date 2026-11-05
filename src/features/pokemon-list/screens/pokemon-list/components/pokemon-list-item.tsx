import { capitalize } from "es-toolkit/string";
import { Link } from "expo-router";
import { memo, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  type PokemonListItem as PokemonListItemType,
  pokemonThumbnailUrl,
} from "@/data/pokemon-api";
import { SkeletonImage } from "@/shared/components/skeleton-image";

import { POKEMON_LIST_ITEM_HEIGHT, POKEMON_LIST_SPRITE_SIZE } from "../constants";

import { FavoriteButton } from "./favorite-button";
import { getFavoriteLabel } from "./pokemon-list-item.utils";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PokemonListItemProps = {
  item: PokemonListItemType;
  isFavorite: boolean;
  onToggleFavorite: (item: PokemonListItemType) => void;
};

export const PokemonListItem = memo(function PokemonListItem({
  item,
  isFavorite,
  onToggleFavorite,
}: PokemonListItemProps) {
  const favoriteLabel = getFavoriteLabel(item.name, isFavorite);

  const favoriteProgress = useSharedValue(isFavorite ? 1 : 0);
  const pressProgress = useSharedValue(0);

  useEffect(() => {
    favoriteProgress.set(
      withTiming(Number(isFavorite), {
        duration: 340,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [isFavorite, favoriteProgress]);

  const rowAnimatedStyle = useAnimatedStyle(() => {
    const press = pressProgress.get();

    return {
      borderColor: interpolateColor(
        favoriteProgress.get(),
        [0, 1],
        ["#e8e8e8", "rgba(227, 53, 13, 0.26)"],
      ),
      backgroundColor: interpolateColor(press, [0, 1], ["#ffffff", "#f3f3f5"]),
      transform: [
        { scale: interpolate(press, [0, 1], [1, 0.985]) },
        { translateY: interpolate(press, [0, 1], [0, 1]) },
      ],
    };
  });

  const handleLinkPressIn = () => {
    pressProgress.set(withSpring(1, { damping: 20, stiffness: 420 }));
  };

  const handleLinkPressOut = () => {
    pressProgress.set(withSpring(0, { damping: 16, stiffness: 260 }));
  };

  return (
    <Animated.View style={[styles.row, rowAnimatedStyle]}>
      <Link
        href={{
          pathname: "/pokemon/[id]",
          params: { id: String(item.id), name: item.name },
        }}
        asChild
      >
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${capitalize(item.name)}`}
          onPressIn={handleLinkPressIn}
          onPressOut={handleLinkPressOut}
          style={styles.link}
        >
          <View style={styles.spriteWrap}>
            <SkeletonImage uri={pokemonThumbnailUrl(item.id)} loadKey={item.id} />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.name}>{capitalize(item.name)}</Text>
            <Text style={styles.id}>#{String(item.id).padStart(4, "0")}</Text>
          </View>
        </AnimatedPressable>
      </Link>

      <FavoriteButton
        isFavorite={isFavorite}
        favoriteLabel={favoriteLabel}
        onToggleFavorite={() => onToggleFavorite(item)}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  row: {
    height: POKEMON_LIST_ITEM_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
  },

  link: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  spriteWrap: {
    width: POKEMON_LIST_SPRITE_SIZE,
    height: POKEMON_LIST_SPRITE_SIZE,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  textBlock: {
    flex: 1,
    gap: 4,
  },

  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
  },

  id: {
    fontSize: 14,
    color: "#666666",
  },
});
