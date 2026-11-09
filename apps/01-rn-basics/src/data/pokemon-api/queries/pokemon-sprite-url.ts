import { POKEAPI_SPRITE_OFFICIAL_ARTWORK_BASE_URL } from "../constants";

export function pokemonSpriteUrl(id: number): string {
  return `${POKEAPI_SPRITE_OFFICIAL_ARTWORK_BASE_URL}/${id}.png`;
}
