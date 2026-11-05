import { clearFavoritePokemon, setFavoritePokemon } from "@/data/db";
import { useLiveFavoritePokemon } from "@/shared/hooks";

type FavoriteTarget = {
  id: number;
  name: string;
};

export function useFavoritePokemon() {
  const { favorite } = useLiveFavoritePokemon();
  const favoriteId = favorite?.id ?? null;

  function toggleFavorite(pokemon: FavoriteTarget) {
    if (favoriteId === pokemon.id) {
      clearFavoritePokemon();
      return;
    }
    setFavoritePokemon({ id: pokemon.id, name: pokemon.name });
  }

  return { favoriteId, toggleFavorite };
}
