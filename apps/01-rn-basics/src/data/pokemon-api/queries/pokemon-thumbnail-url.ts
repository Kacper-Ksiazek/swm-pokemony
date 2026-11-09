import { POKEAPI_SPRITE_THUMBNAIL_BASE_URL } from "../constants";

export function pokemonThumbnailUrl(id: number): string {
  return `${POKEAPI_SPRITE_THUMBNAIL_BASE_URL}/${id}.png`;
}
