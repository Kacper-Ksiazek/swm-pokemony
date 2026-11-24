/** Jedna bryła na planszy — pozycja środka, skala, kolor (linear RGB). */
export type BlockSpec = {
  readonly position: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly color: readonly [number, number, number];
  readonly roughness?: number;
};

const W = 0.55;
const H = 0.45;

/** Prosta forteca po prawej — pod przyszłą procą z lewej. */
export const LEVEL_01: readonly BlockSpec[] = [
  { position: [4.2, H / 2, -0.65], scale: [W, H, W], color: [0.52, 0.38, 0.22] },
  { position: [4.2, H / 2, 0], scale: [W, H, W], color: [0.52, 0.38, 0.22] },
  { position: [4.2, H / 2, 0.65], scale: [W, H, W], color: [0.52, 0.38, 0.22] },

  { position: [3.55, H * 1.5, -0.32], scale: [W, H, W], color: [0.5, 0.5, 0.48], roughness: 0.85 },
  { position: [3.55, H * 1.5, 0.32], scale: [W, H, W], color: [0.5, 0.5, 0.48], roughness: 0.85 },

  { position: [2.95, H * 2.5, 0], scale: [W, H, W], color: [0.52, 0.38, 0.22] },

  // „Świnka” — na razie zielony bloczek
  {
    position: [4.2, H * 2.5, 0],
    scale: [W * 0.9, H * 0.9, W * 0.9],
    color: [0.35, 0.72, 0.38],
    roughness: 0.75,
  },
];
