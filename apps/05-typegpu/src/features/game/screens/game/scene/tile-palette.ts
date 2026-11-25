import type { TileKind } from "../../../blueprint";

/** Tile colors as sRGB hex. `THREE.Color.setHex` converts them to linear for lighting. */
export const TILE_COLORS: Record<TileKind, number> = {
  start: 0x2ec4b6,
  event: 0xffc23d,
  action: 0xff8a3d,
  payday: 0x52c46b,
  stop: 0xe63946,
  career: 0x3d8bff,
  house: 0x4d6bff,
  baby: 0xff7eb6,
  pet: 0xa66bff,
  retire: 0xffd700,
};

/** Tile height multiplier: stops stand out so players see where they must halt. */
export const TILE_HEIGHT_SCALE: Record<TileKind, number> = {
  start: 1.6,
  event: 1,
  action: 1,
  payday: 1,
  stop: 1.9,
  career: 1.3,
  house: 1.3,
  baby: 1.3,
  pet: 1.3,
  retire: 2.2,
};

/** Polish names shown in the legend. */
export const TILE_KIND_LABELS: Record<TileKind, string> = {
  start: "Start",
  event: "Wydarzenie",
  action: "Karta akcji",
  payday: "Wypłata",
  stop: "Postój",
  career: "Kariera",
  house: "Dom",
  baby: "Dziecko",
  pet: "Zwierzak",
  retire: "Emerytura",
};
