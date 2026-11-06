import { useEffect, useRef, useState } from "react";

import type { PokemonListState, UsePokemonListResult } from "./use-pokemon-list.types";
import { loadPage } from "./use-pokemon-list.utils";

const initialState: PokemonListState = {
  items: [],
  initialLoading: true,
  refreshing: false,
  loadingMore: false,
  error: null,
  nextOffset: 0,
};

export function usePokemonList(): UsePokemonListResult {
  const [state, setState] = useState<PokemonListState>(initialState);
  const requestIdRef = useRef(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    loadPage({ offset: 0, mode: "initial", requestIdRef, setState });
  }, []);

  function refresh() {
    const current = stateRef.current;
    if (current.refreshing || current.initialLoading) {
      return;
    }

    loadPage({ offset: 0, mode: "refresh", requestIdRef, setState });
  }

  function loadMore() {
    const current = stateRef.current;
    if (
      current.initialLoading ||
      current.refreshing ||
      current.loadingMore ||
      current.error !== null ||
      current.nextOffset === null
    ) {
      return;
    }

    loadPage({ offset: current.nextOffset, mode: "more", requestIdRef, setState });
  }

  function retry() {
    const current = stateRef.current;

    loadPage({
      offset: 0,
      mode: current.items.length === 0 ? "initial" : "refresh",
      requestIdRef,
      setState,
    });
  }

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
