import { capitalize } from "es-toolkit/string";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { pokemonSpriteUrl } from "@/data/pokemon-api";
import { Button } from "@/shared/components/button";
import { EmptyState } from "@/shared/components/empty-state";
import { PokemonIdBadge } from "@/shared/components/pokemon-id-badge";
import { LoadingStatusScreen } from "@/shared/components/status-screen";
import { COLORS, SPACING, TYPE_SIZE } from "@/shared/styles/colors";

import { useFavoritePokemon } from "./hooks";

const HERO_IMAGE_MAX = 280;

export function PokemonFavoriteScreen() {
  const { favorite, loading, removeFavorite } = useFavoritePokemon();

  if (loading) {
    return <LoadingStatusScreen message="Loading favorite…" />;
  }

  if (favorite === null) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <EmptyState
          icon={{ ios: "heart", android: "favorite_border", web: "favorite_border" }}
          title="No favorite yet"
          message="Tap the heart on a Pokémon in the list."
          href="/"
          actionLabel="Open the list"
        />
      </SafeAreaView>
    );
  }

  const displayName = capitalize(favorite.name);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Image
          source={{ uri: pokemonSpriteUrl(favorite.id) }}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
        <Text style={styles.name}>{displayName}</Text>
        <PokemonIdBadge id={favorite.id} />
      </View>

      <View style={styles.actions}>
        <Link
          href={{
            pathname: "/pokemon-favorite/[id]",
            params: { id: String(favorite.id), name: favorite.name },
          }}
          asChild
        >
          <Button
            variant="primary"
            label="View details"
            accessibilityLabel={`View details for ${favorite.name}`}
            icon={{ ios: "info.circle", android: "info", web: "info" }}
          />
        </Link>

        <Button
          variant="secondary"
          label="Remove favorite"
          accessibilityLabel={`Remove ${favorite.name} from favorites`}
          icon={{ ios: "trash", android: "delete", web: "delete" }}
          onPress={removeFavorite}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingTop: SPACING.xl,
    gap: SPACING.sm,
  },
  actions: {
    alignSelf: "stretch",
    marginTop: "auto",
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  image: {
    width: "100%",
    maxWidth: HERO_IMAGE_MAX,
    aspectRatio: 1,
  },
  name: {
    fontSize: TYPE_SIZE.title,
    fontWeight: "700",
    color: COLORS.TEXT,
    paddingHorizontal: SPACING.xl,
  },
});
