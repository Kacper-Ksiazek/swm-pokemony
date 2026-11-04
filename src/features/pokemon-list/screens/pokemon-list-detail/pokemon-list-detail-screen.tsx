import { capitalize } from "es-toolkit/string";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { pokemonSpriteUrl } from "@/data/pokemon-api";
import { EmptyState } from "@/shared/components/empty-state";
import { PokemonDetails } from "@/shared/components/pokemon-details";
import { usePokemonDetail } from "@/shared/hooks/use-pokemon-detail";
import { COLORS } from "@/shared/styles/colors";

import { useFavoritePokemon } from "../../hooks/use-favorite-pokemon";

export function PokemonListDetailScreen() {
  const { id: idParam, name: nameParam } = useLocalSearchParams<{ id: string; name?: string }>();
  const pokemonId = parsePokemonId(idParam);
  const name = firstParam(nameParam);
  const { detail, detailLoading, detailError, retryDetail } = usePokemonDetail(pokemonId);
  const { favoriteId, toggleFavorite } = useFavoritePokemon();
  const displayName = detail?.name ?? name;
  const isFavorite = pokemonId !== null && favoriteId === pokemonId;

  if (pokemonId === null) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
        <EmptyState message="This Pokémon could not be found." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
      <View style={styles.header}>
        <Image
          source={{ uri: pokemonSpriteUrl(pokemonId) }}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
        <Text style={styles.name}>{capitalize(displayName ?? "Pokémon")}</Text>
        <Text style={styles.id}>#{String(pokemonId).padStart(4, "0")}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PokemonDetails
          detail={detail}
          loading={detailLoading}
          error={detailError}
          onRetry={retryDetail}
        />

        {displayName !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? `Remove ${displayName} from favorites`
                : `Mark ${displayName} as favorite`
            }
            onPress={() => toggleFavorite({ id: pokemonId, name: displayName })}
          >
            <View style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}>
              <SymbolView
                name={{
                  ios: isFavorite ? "heart.fill" : "heart",
                  android: isFavorite ? "favorite" : "favorite_border",
                  web: isFavorite ? "favorite" : "favorite_border",
                }}
                size={20}
                tintColor={isFavorite ? "#ffffff" : "#111111"}
              />
              <Text style={[styles.favoriteLabel, isFavorite && styles.favoriteLabelActive]}>
                {isFavorite ? "Remove favorite" : "Mark as favorite"}
              </Text>
            </View>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function firstParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
    return value[0];
  }

  return null;
}

function parsePokemonId(value: string | string[] | undefined): number | null {
  const raw = firstParam(value);

  if (raw === null) {
    return null;
  }

  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 8,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 8,
  },

  image: {
    width: 240,
    height: 240,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
  },

  id: {
    fontSize: 16,
    color: "#666666",
  },

  favoriteButton: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
  },

  favoriteButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },

  favoriteLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },

  favoriteLabelActive: {
    color: "#ffffff",
  },
});
