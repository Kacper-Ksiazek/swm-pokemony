import { groundAt, PROMENADE, ROADS_ACROSS, type Color } from "@/world/layout";

import { IDENTITY, piece, type Piece, type Vec3 } from "./space";

/** The pier runs out to sea along the street at this x. */
export const PIER_X = ROADS_ACROSS.find((x) => x > 20) ?? 28;
const PIER_START = PROMENADE.near - 1;
const PIER_NECK_END = -84;
const PIER_WIDTH = 5;
/** The top of the deck, in metres above calm sea. */
export const DECK = 2;
const SPANS = 7;
/** Height of a lamp's light above the deck or promenade. */
const LAMP_HEIGHT = 4;

const PLANKS: Color = [0.55, 0.42, 0.3];
const PILE: Color = [0.32, 0.27, 0.22];
export const RAIL: Color = [0.92, 0.92, 0.9];
export const POST: Color = [0.2, 0.22, 0.24];
export const NEON_PINK: Color = [1, 0.18, 0.6];
export const NEON_CYAN: Color = [0.15, 0.85, 1];
const LAMP_GLOW: Color = [1, 0.72, 0.42];

/** Warm white of a lamp's light, in linear colour. */
export const LAMP_LIGHT: Vec3 = [1, 0.7, 0.42];

export type Span = {
  readonly slot: number;
  /** Centre of the deck, which the span turns about as it breaks. */
  readonly centre: Vec3;
  readonly length: number;
  readonly width: number;
  readonly pieces: readonly Piece[];
  /** The lamps that stand on this span, which go out when it falls. */
  readonly lamps: readonly number[];
};

export type Lamp = {
  /** Where its light hangs. */
  readonly light: Vec3;
  /** The span it stands on, or undefined on the promenade. */
  readonly span?: number;
};

/**
 * Something that stands on its own foot until the flood knocks it over: a lamp post on the
 * promenade, or the arch onto the pier.
 */
export type Post = {
  /** The foot it stands on and falls about; its pieces are placed from here. */
  readonly foot: Vec3;
  readonly pieces: readonly Piece[];
  /** The lamp it carries, which goes out when it falls. */
  readonly lamp?: number;
  /** How wide it stands across the water, in metres, and what push it withstands, in kN. */
  readonly width: number;
  readonly strength: number;
};

/** A lamp post meets the water with its pole; the arch with both its legs. */
const LAMP_WIDTH = 0.3;
const LAMP_STRENGTH = 6;
const ARCH_WIDTH = 0.8;
const ARCH_STRENGTH = 20;

/** A lamp post: a dark pole and a glowing head, both relative to the foot of the pole. */
const lampPieces = (foot: Vec3): Piece[] => [
  piece([foot[0], foot[1] + LAMP_HEIGHT / 2, foot[2]], [0.16, LAMP_HEIGHT, 0.16], POST),
  piece(
    [foot[0], foot[1] + LAMP_HEIGHT + 0.15, foot[2]],
    [0.55, 0.35, 0.55],
    [0.95, 0.9, 0.8],
    IDENTITY,
    LAMP_GLOW,
  ),
];

/**
 * A span of deck on piles, with white rails along both sides and a neon strip under each rail:
 * pink on the left, cyan on the right.
 */
function spanPieces(length: number, width: number, centre: Vec3): Piece[] {
  const bed = groundAt(centre[0], centre[2]);
  const pileHeight = DECK - bed;
  const pieces: Piece[] = [
    piece([0, -0.2, 0], [width, 0.4, length], PLANKS),
    piece([-width / 2 + 0.1, 0.55, 0], [0.12, 0.9, length], RAIL),
    piece([width / 2 - 0.1, 0.55, 0], [0.12, 0.9, length], RAIL),
    piece([-width / 2 - 0.02, -0.05, 0], [0.08, 0.08, length], NEON_PINK, IDENTITY, NEON_PINK),
    piece([width / 2 + 0.02, -0.05, 0], [0.08, 0.08, length], NEON_CYAN, IDENTITY, NEON_CYAN),
  ];

  for (const side of [-1, 1]) {
    for (const end of [-0.5, 0.5]) {
      pieces.push(
        piece(
          [side * (width / 2 - 0.4), -pileHeight / 2, end * (length - 0.6)],
          [0.35, pileHeight, 0.35],
          PILE,
        ),
      );
    }
  }

  return pieces;
}

/** The pier: a neck of equal spans out to sea, then a wide T head, with lamps on every other span. */
export function placePier() {
  const spans: Span[] = [];
  const lamps: Lamp[] = [];
  const pieces: Piece[] = [];
  const neck = (PIER_START - PIER_NECK_END) / SPANS;

  for (let i = 0; i < SPANS; i++) {
    const z = PIER_START - neck * (i + 0.5);
    const centre: Vec3 = [PIER_X, DECK, z];
    const own: number[] = [];

    if (i % 2 === 1) {
      const side = i % 4 === 1 ? -1 : 1;
      own.push(lamps.length);
      lamps.push({
        light: [PIER_X + side * (PIER_WIDTH / 2 - 0.3), DECK + LAMP_HEIGHT, z],
        span: i,
      });
    }

    const spanPiecesHere = spanPieces(neck, PIER_WIDTH, centre);

    for (const index of own) {
      const [x, , lz] = lamps[index].light;
      spanPiecesHere.push(...lampPieces([x - PIER_X, 0, lz - z]));
    }

    spans.push({
      slot: i,
      centre,
      length: neck,
      width: PIER_WIDTH,
      pieces: spanPiecesHere,
      lamps: own,
    });
  }

  // The T head, wide across the end of the pier, with a lamp at each corner
  const head = 8;
  const headCentre: Vec3 = [PIER_X, DECK, PIER_NECK_END - head / 2];
  const headPieces = spanPieces(head, 18, headCentre);
  const headLamps: number[] = [];

  for (const x of [-8.4, 8.4]) {
    for (const z of [-3.4, 3.4]) {
      headLamps.push(lamps.length);
      lamps.push({ light: [PIER_X + x, DECK + LAMP_HEIGHT, headCentre[2] + z], span: SPANS });
      headPieces.push(...lampPieces([x, 0, z]));
    }
  }

  spans.push({
    slot: SPANS,
    centre: headCentre,
    length: head,
    width: 18,
    pieces: headPieces,
    lamps: headLamps,
  });

  // A neon arch over the way onto the pier
  const arch = PIER_START + 0.5;
  const archPieces: Piece[] = [];

  for (const side of [-1, 1]) {
    archPieces.push(piece([side * 3, 2.6, 0], [0.4, 5.2, 0.4], RAIL));
  }

  archPieces.push(piece([0, 5.4, 0], [6.4, 0.6, 0.4], RAIL));
  archPieces.push(piece([0, 5.4, -0.25], [5.6, 0.25, 0.1], NEON_PINK, IDENTITY, NEON_PINK));
  archPieces.push(piece([0, 4.9, -0.25], [5.6, 0.12, 0.1], NEON_CYAN, IDENTITY, NEON_CYAN));
  const gate: Post = {
    foot: [PIER_X, groundAt(PIER_X, arch), arch],
    pieces: archPieces,
    width: ARCH_WIDTH,
    strength: ARCH_STRENGTH,
  };

  return { spans, lamps, pieces, gate };
}

export function placePromenadeLamps(lamps: Lamp[], posts: Post[]) {
  const z = PROMENADE.near + 0.6;

  for (let x = -90; x <= 90; x += 15) {
    if (Math.abs(x - PIER_X) < 5) continue;

    const foot: Vec3 = [x, groundAt(x, z), z];
    posts.push({
      foot,
      pieces: lampPieces([0, 0, 0]),
      lamp: lamps.length,
      width: LAMP_WIDTH,
      strength: LAMP_STRENGTH,
    });
    lamps.push({ light: [x, foot[1] + LAMP_HEIGHT, z] });
  }
}
