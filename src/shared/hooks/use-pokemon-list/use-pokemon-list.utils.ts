import type { Dispatch, RefObject, SetStateAction } from "react";

import { fetchPokemonListPage } from "@/data/pokemon-api";

import type { PokemonListLoadMode, PokemonListState } from "./use-pokemon-list.types";

interface LoadPageArgs {
  offset: number;
  mode: PokemonListLoadMode;
  requestIdRef: RefObject<number>;
  setState: Dispatch<SetStateAction<PokemonListState>>;
}

export async function loadPage({
  offset, //
  mode,
  requestIdRef,
  setState,
}: LoadPageArgs) {
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
}
