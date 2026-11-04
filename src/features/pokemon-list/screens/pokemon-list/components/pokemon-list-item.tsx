import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { pokemonSpriteUrl } from "../../../api/fetch-pokemon-list";
import type { PokemonListItem as PokemonListItemType } from "../../../api/types";

type PokemonListItemProps = {
  item: PokemonListItemType;
};

function formatPokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function PokemonListItem({ item }: PokemonListItemProps) {
  return (
    <View style={styles.row}>
      <Image
        source={{ uri: pokemonSpriteUrl(item.id) }}
        style={styles.image}
        contentFit="contain"
        transition={200}
      />
      <View style={styles.textBlock}>
        <Text style={styles.name}>{formatPokemonName(item.name)}</Text>
        <Text style={styles.id}>#{String(item.id).padStart(4, "0")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  image: {
    width: 56,
    height: 56,
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
