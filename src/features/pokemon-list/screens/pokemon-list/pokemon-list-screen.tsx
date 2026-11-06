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
import { ErrorStatusScreen } from "@/shared/components/status-screen";
import { usePokemonList } from "@/shared/hooks";
import { COLORS } from "@/shared/styles/colors";
import { useFavoritePokemon } from "../../hooks";
import { PokemonListItem } from "./components";
import { PokemonListSkeleton } from "./components/pokemon-list-skeleton";
import { POKEMON_LIST_ITEM_GAP, POKEMON_LIST_ITEM_HEIGHT } from "./constants";

function getItemLayout(_data: ArrayLike<PokemonListItemType> | null | undefined, index: number) {
  return {
    length: POKEMON_LIST_ITEM_HEIGHT,
    offset: index * (POKEMON_LIST_ITEM_HEIGHT + POKEMON_LIST_ITEM_GAP),
    index,
  };
}

export function PokemonListScreen() {
  const { favoriteId, toggleFavorite } = useFavoritePokemon();
  const { items, initialLoading, refreshing, loadingMore, error, refresh, loadMore, retry } =
    usePokemonList();

  function renderItem({ item }: ListRenderItemInfo<PokemonListItemType>) {
    return (
      <PokemonListItem
        item={item}
        isFavorite={favoriteId === item.id}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  if (initialLoading) {
    return <PokemonListSkeleton />;
  }

  if (error !== null && items.length === 0) {
    return (
      <ErrorStatusScreen
        title="Could not load the list"
        message="Check your connection and try again."
        detail={__DEV__ ? error : undefined}
        onRetry={retry}
      />
    );
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
      contentInsetAdjustmentBehavior="automatic"
      style={styles.list}
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
      ListEmptyComponent={
        <EmptyState
          icon={{ ios: "tray", android: "inbox", web: "inbox" }}
          title="Nothing here"
          message="No Pokémon found."
        />
      }
      contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  emptyList: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 16,
  },
});
