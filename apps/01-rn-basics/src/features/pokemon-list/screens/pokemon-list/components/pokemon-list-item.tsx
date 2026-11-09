import { capitalize } from "es-toolkit/string";
import { Link } from "expo-router";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  type PokemonListItem as PokemonListItemType,
  pokemonThumbnailUrl,
} from "@/data/pokemon-api";
import { PokemonIdBadge } from "@/shared/components/pokemon-id-badge";
import { PressableScale } from "@/shared/components/pressable-scale";
import { SkeletonImage } from "@/shared/components/skeleton-image";
import { COLORS } from "@/shared/styles/colors";

import { POKEMON_LIST_ITEM_HEIGHT, POKEMON_LIST_SPRITE_SIZE } from "../constants";

import { FavoriteButton } from "./favorite-button";
import { getFavoriteLabel } from "./pokemon-list-item.utils";

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

  return (
    <View style={styles.row}>
      <Link
        href={{
          pathname: "/pokemon/[id]",
          params: { id: String(item.id), name: item.name },
        }}
        asChild
      >
        <PressableScale
          pressedScale={0.985}
          accessibilityRole="button"
          accessibilityLabel={`Open ${capitalize(item.name)}`}
          style={styles.link}
        >
          <View style={styles.spriteWrap}>
            <SkeletonImage uri={pokemonThumbnailUrl(item.id)} loadKey={item.id} />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.name}>{capitalize(item.name)}</Text>
            <PokemonIdBadge id={item.id} />
          </View>
        </PressableScale>
      </Link>

      <FavoriteButton
        isFavorite={isFavorite}
        favoriteLabel={favoriteLabel}
        onToggleFavorite={() => onToggleFavorite(item)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    height: POKEMON_LIST_ITEM_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.BORDER,
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
    alignItems: "flex-start",
    gap: 4,
  },

  name: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.TEXT,
  },
});
