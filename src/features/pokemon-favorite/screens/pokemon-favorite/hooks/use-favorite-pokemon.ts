import { clearFavoritePokemon } from "@/data/db";
import { useLiveFavoritePokemon } from "@/shared/hooks/use-live-favorite-pokemon";

export function useFavoritePokemon() {
  const { favorite, loaded } = useLiveFavoritePokemon();

  return {
    favorite,
    // loaded stays false until the first query result arrives.
    loading: !loaded,
    removeFavorite: () => {
      clearFavoritePokemon();
    },
  };
}
