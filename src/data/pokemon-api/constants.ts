export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

const POKEAPI_SPRITES_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const POKEAPI_SPRITE_OFFICIAL_ARTWORK_BASE_URL = `${POKEAPI_SPRITES_BASE_URL}/other/official-artwork`;

// 96x96 sprite: ~25x less decoded memory than the 475x475 official artwork.
export const POKEAPI_SPRITE_THUMBNAIL_BASE_URL = POKEAPI_SPRITES_BASE_URL;
