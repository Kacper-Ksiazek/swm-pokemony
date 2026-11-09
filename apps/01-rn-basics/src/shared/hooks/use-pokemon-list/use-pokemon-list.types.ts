import type { PokemonListItem } from "@/data/pokemon-api";

export type PokemonListLoadMode = "initial" | "refresh" | "more";

export type PokemonListState = {
  items: PokemonListItem[];
  initialLoading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  nextOffset: number | null;
};

export interface UsePokemonListResult {
  items: PokemonListItem[];
  initialLoading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;

  refresh: () => void;
  loadMore: () => void;
  retry: () => void;
}
