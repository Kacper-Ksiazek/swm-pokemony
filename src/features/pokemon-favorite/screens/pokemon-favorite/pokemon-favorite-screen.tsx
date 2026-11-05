import { capitalize } from "es-toolkit/string";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { pokemonSpriteUrl } from "@/data/pokemon-api";
import { EmptyState } from "@/shared/components/empty-state";
import { COLORS } from "@/shared/styles/colors";

import { useFavoritePokemon } from "./hooks";

export function PokemonFavoriteScreen() {
  const { favorite, loading, removeFavorite } = useFavoritePokemon();

  if (loading) {
    return <SafeAreaView style={styles.container} edges={["top", "bottom"]} />;
  }

  if (favorite === null) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <EmptyState message="No favorite yet. Tap the heart on a Pokémon in the list." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Image
          source={{ uri: pokemonSpriteUrl(favorite.id) }}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
        <Text style={styles.name}>{capitalize(favorite.name)}</Text>
        <Text style={styles.id}>#{String(favorite.id).padStart(4, "0")}</Text>
      </View>

      <View style={styles.actions}>
        <Link
          href={{
            pathname: "/pokemon-favorite/[id]",
            params: { id: String(favorite.id), name: favorite.name },
          }}
          asChild
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View details for ${favorite.name}`}
          >
            <View style={styles.actionButton}>
              <SymbolView
                name={{ ios: "info.circle", android: "info", web: "info" }}
                size={20}
                tintColor="#111111"
              />
              <Text style={styles.actionLabel}>View details</Text>
            </View>
          </Pressable>
        </Link>

        <Pressable
          onPress={removeFavorite}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${favorite.name} from favorites`}
        >
          <View style={[styles.actionButton, styles.dangerButton]}>
            <SymbolView
              name={{ ios: "trash", android: "delete", web: "delete" }}
              size={20}
              tintColor="#ffffff"
            />
            <Text style={[styles.actionLabel, styles.dangerLabel]}>Remove favorite</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  header: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingTop: 24,
    gap: 8,
  },

  actions: {
    alignSelf: "stretch",
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 16,
  },

  image: {
    alignSelf: "stretch",
    width: "100%",
    aspectRatio: 1,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
    paddingHorizontal: 24,
  },

  id: {
    fontSize: 16,
    color: "#666666",
    paddingHorizontal: 24,
  },

  actionButton: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
  },

  actionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },

  dangerButton: {
    backgroundColor: COLORS.PRIMARY,
  },

  dangerLabel: {
    color: "#ffffff",
  },
});
