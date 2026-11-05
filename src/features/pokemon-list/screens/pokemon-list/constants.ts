/** Sprite box in each list row (`pokemon-list-item` spriteWrap). */
export const POKEMON_LIST_SPRITE_SIZE = 72;

/** Vertical inset when the sprite is centered in a fixed-height row. */
export const POKEMON_LIST_ROW_VERTICAL_INSET = 10;

/** Fixed row height for `getItemLayout` (sprite + top/bottom inset). */
export const POKEMON_LIST_ITEM_HEIGHT =
  POKEMON_LIST_SPRITE_SIZE + 2 * POKEMON_LIST_ROW_VERTICAL_INSET;

/** Gap between rows (`FlatList` contentContainerStyle + `getItemLayout`). */
export const POKEMON_LIST_ITEM_GAP = 8;

/** Top inset for the list content and first-row offset in `getItemLayout`. */
export const POKEMON_LIST_PADDING_TOP = 64;
