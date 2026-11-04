import { useCallback, useEffect, useRef, useState } from "react";

import { fetchPokemonListPage, type PokemonListItem } from "@/data/pokemon-api";

type PokemonListState = {
  items: PokemonListItem[];
  initialLoading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  nextOffset: number | null;
};

const initialState: PokemonListState = {
  items: [],
  initialLoading: true,
  refreshing: false,
  loadingMore: false,
  error: null,
  nextOffset: 0,
};

export function usePokemonList() {
  const [state, setState] = useState<PokemonListState>(initialState);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(async (offset: number, mode: "initial" | "refresh" | "more") => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setState((current) => ({
      ...current,
      error: null,
      initialLoading: mode === "initial",
      refreshing: mode === "refresh",
      loadingMore: mode === "more",
    }));

    try {
      const { items, nextOffset } = await fetchPokemonListPage(offset);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setState((current) => ({
        ...current,
        items: mode === "more" ? [...current.items, ...items] : items,
        nextOffset,
        initialLoading: false,
        refreshing: false,
        loadingMore: false,
        error: null,
      }));
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      const message = error instanceof Error ? error.message : "Failed to load Pokémon";

      setState((current) => ({
        ...current,
        initialLoading: false,
        refreshing: false,
        loadingMore: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    void loadPage(0, "initial");
  }, [loadPage]);

  const refresh = useCallback(() => {
    if (state.refreshing || state.initialLoading) {
      return;
    }
    void loadPage(0, "refresh");
  }, [loadPage, state.initialLoading, state.refreshing]);

  const loadMore = useCallback(() => {
    if (
      state.initialLoading ||
      state.refreshing ||
      state.loadingMore ||
      state.error !== null ||
      state.nextOffset === null
    ) {
      return;
    }
    void loadPage(state.nextOffset, "more");
  }, [loadPage, state]);

  const retry = useCallback(() => {
    void loadPage(0, state.items.length === 0 ? "initial" : "refresh");
  }, [loadPage, state.items.length]);

  return {
    items: state.items,
    initialLoading: state.initialLoading,
    refreshing: state.refreshing,
    loadingMore: state.loadingMore,
    error: state.error,
    refresh,
    loadMore,
    retry,
  };
}
