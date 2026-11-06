import { capitalize } from "es-toolkit/string";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { insertMapPin } from "@/data/db";
import { type PokemonListItem, pokemonThumbnailUrl } from "@/data/pokemon-api";
import { EmptyState } from "@/shared/components/empty-state";
import { SkeletonImage } from "@/shared/components/skeleton-image";
import { ErrorStatusScreen, LoadingStatusScreen } from "@/shared/components/status-screen";
import { usePokemonList } from "@/shared/hooks";
import { COLORS } from "@/shared/styles/colors";

import { useMapSheetContext, useMapSheetPayload } from "../../../../map-sheet-context";

export function PokemonPicker() {
  const { items, initialLoading, loadingMore, error, loadMore, retry } = usePokemonList();
  const { close } = useMapSheetContext();
  const coordinate = useMapSheetPayload("pokemon-picker");

  if (coordinate === null) {
    return null;
  }

  function handlePick(pokemon: PokemonListItem) {
    if (coordinate === null) {
      return;
    }

    insertMapPin({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      pokemonId: pokemon.id,
      name: pokemon.name,
    });

    close();
  }

  if (initialLoading) {
    return <LoadingStatusScreen message="Loading Pokémon…" />;
  }

  if (error !== null && items.length === 0) {
    return <ErrorStatusScreen title="Could not load the list" message={error} onRetry={retry} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Pokémon</Text>
      <Text style={styles.coordinate}>
        {coordinate.latitude.toFixed(5)}, {coordinate.longitude.toFixed(5)}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Pin ${capitalize(item.name)} here`}
            testID={`pin-${item.name}`}
            onPress={() => handlePick(item)}
            style={styles.row}
          >
            <SkeletonImage uri={pokemonThumbnailUrl(item.id)} loadKey={item.id} size={48} />
            <Text style={styles.name}>{capitalize(item.name)}</Text>
          </Pressable>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        style={styles.list}
        ListEmptyComponent={<EmptyState message="No Pokémon found." />}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={COLORS.PRIMARY} style={styles.footer} />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111111",
  },
  coordinate: {
    fontSize: 14,
    color: "#666666",
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
  },
  footer: {
    paddingVertical: 12,
  },
});
