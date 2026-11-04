import { useCallback } from "react";

import { clearFavoritePokemon, setFavoritePokemon } from "@/data/db";
import { useLiveFavoritePokemon } from "@/shared/hooks/use-live-favorite-pokemon";

type FavoriteTarget = {
  id: number;
  name: string;
};

export function useFavoritePokemon() {
  const { favorite } = useLiveFavoritePokemon();
  const favoriteId = favorite?.id ?? null;

  const toggleFavorite = useCallback(
    (pokemon: FavoriteTarget) => {
      if (favoriteId === pokemon.id) {
        clearFavoritePokemon();
        return;
      }
      setFavoritePokemon({ id: pokemon.id, name: pokemon.name });
    },
    [favoriteId],
  );

  return { favoriteId, toggleFavorite };
}
