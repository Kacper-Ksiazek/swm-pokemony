import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { favoritePokemonQuery } from "@/data/db";

export function useLiveFavoritePokemon() {
  const { data, error, updatedAt } = useLiveQuery(favoritePokemonQuery());

  return {
    favorite: data?.[0] ?? null,
    loaded: updatedAt !== undefined || error !== undefined,
    error: error instanceof Error ? error.message : null,
  };
}
