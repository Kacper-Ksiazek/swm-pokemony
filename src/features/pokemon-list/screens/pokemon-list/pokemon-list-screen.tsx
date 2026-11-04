import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { PokemonListItem as PokemonListItemType } from "../../api/types";
import { PokemonListItem } from "./components/pokemon-list-item";
import { usePokemonList } from "./hooks/use-pokemon-list";

export function PokemonListScreen() {
  const { items, initialLoading, refreshing, loadingMore, error, refresh, loadMore, retry } =
    usePokemonList();

  if (initialLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e3350d" />
        <Text style={styles.helperText}>Loading Pokémon…</Text>
      </View>
    );
  }

  if (error !== null && items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load the list</Text>
        <Text style={styles.helperText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList<PokemonListItemType>
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <PokemonListItem item={item} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#e3350d" />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color="#e3350d" />
          </View>
        ) : undefined
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.helperText}>No Pokémon found.</Text>
        </View>
      }
      contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  emptyList: {
    flexGrow: 1,
  },
  helperText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e3350d",
  },
  retryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  footer: {
    paddingVertical: 16,
  },
});
