import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import type { PokemonListItem as PokemonListItemType } from "@/data/pokemon-api";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorStatusScreen, LoadingStatusScreen } from "@/shared/components/status-screen";
import { COLORS } from "@/shared/styles/colors";
import { useFavoritePokemon } from "../../hooks/use-favorite-pokemon";
import { PokemonListItem } from "./components/pokemon-list-item";
import {
  POKEMON_LIST_ITEM_GAP,
  POKEMON_LIST_ITEM_HEIGHT,
  POKEMON_LIST_PADDING_TOP,
} from "./constants";
import { usePokemonList } from "./hooks/use-pokemon-list";

function getItemLayout(_data: ArrayLike<PokemonListItemType> | null | undefined, index: number) {
  return {
    length: POKEMON_LIST_ITEM_HEIGHT,
    offset: POKEMON_LIST_PADDING_TOP + index * (POKEMON_LIST_ITEM_HEIGHT + POKEMON_LIST_ITEM_GAP),
    index,
  };
}

export function PokemonListScreen() {
  const { favoriteId, toggleFavorite } = useFavoritePokemon();
  const { items, initialLoading, refreshing, loadingMore, error, refresh, loadMore, retry } =
    usePokemonList();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PokemonListItemType>) => (
      <PokemonListItem
        item={item}
        isFavorite={favoriteId === item.id}
        onToggleFavorite={toggleFavorite}
      />
    ),
    [favoriteId, toggleFavorite],
  );

  if (initialLoading) {
    return <LoadingStatusScreen message="Loading Pokémon…" />;
  }

  if (error !== null && items.length === 0) {
    return <ErrorStatusScreen title="Could not load the list" message={error} onRetry={retry} />;
  }

  return (
    <FlatList<PokemonListItemType>
      data={items}
      extraData={favoriteId}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      windowSize={7}
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.PRIMARY} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
          </View>
        ) : undefined
      }
      ListEmptyComponent={<EmptyState message="No Pokémon found." />}
      contentContainerStyle={items.length === 0 ? styles.emptyList : styles.contentContainer}
    />
  );
}

const styles = StyleSheet.create({
  emptyList: {
    flexGrow: 1,
  },

  footer: {
    paddingVertical: 16,
  },

  contentContainer: {
    gap: POKEMON_LIST_ITEM_GAP,
    paddingHorizontal: 8,
    paddingTop: POKEMON_LIST_PADDING_TOP,
  },
});
