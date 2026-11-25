/**
 * The beach as plain numbers: the pier and its spans, the lamps, the palms, where boats lie at
 * anchor and the line of buoys. No GPU imports.
 */
import { groundAt, ISLET, PROMENADE, ROADS_ACROSS, type Color } from "@/world/layout";

export type Vec3 = readonly [number, number, number];
export type Quaternion = readonly [number, number, number, number];

/** A box placed relative to something: its centre, its turn and its size. */
export type Piece = {
  readonly offset: Vec3;
  readonly rotation: Quaternion;
  readonly size: Vec3;
  readonly color: Color;
  /** Light it gives off at night, multiplied by the evening's glow; zero for none. */
  readonly glow: Color;
};

export const IDENTITY: Quaternion = [0, 0, 0, 1];

export const turnAbout = (axis: Vec3, angle: number): Quaternion => {
  const s = Math.sin(angle / 2);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];
};

export const multiply = (a: Quaternion, b: Quaternion): Quaternion => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];

export const rotate = (q: Quaternion, [x, y, z]: Vec3): Vec3 => {
  const [ux, uy, uz, w] = q;
  const cx = uy * z - uz * y;
  const cy = uz * x - ux * z;
  const cz = ux * y - uy * x;
  return [
    x + 2 * (w * cx + uy * cz - uz * cy),
    y + 2 * (w * cy + uz * cx - ux * cz),
    z + 2 * (w * cz + ux * cy - uy * cx),
  ];
};

const piece = (
  offset: Vec3,
  size: Vec3,
  color: Color,
  rotation: Quaternion = IDENTITY,
  glow: Color = [0, 0, 0],
): Piece => ({ offset, rotation, size, color, glow });

// ---- Pier ----------------------------------------------------------------------------------

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
const RAIL: Color = [0.92, 0.92, 0.9];
const POST: Color = [0.2, 0.22, 0.24];
const NEON_PINK: Color = [1, 0.18, 0.6];
const NEON_CYAN: Color = [0.15, 0.85, 1];
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
function placePier() {
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

// ---- Ferris wheel --------------------------------------------------------------------------

/** The wheel on the pier's head: its axle above the deck, its radius, and how many cars. */
const WHEEL_AXLE: Vec3 = [0, 10, -1];
const WHEEL_RADIUS = 8;
const WHEEL_CARS = 10;
const WHEEL_RIM = 24;

export type Wheel = {
  /** The axle, relative to the centre of the pier's head. */
  readonly axle: Vec3;
  readonly radius: number;
  /** Pieces that turn with the wheel, about the axle, which runs along z. */
  readonly turning: readonly Piece[];
  /** Cars that hang level from the rim, by their angle around it. */
  readonly cars: readonly { readonly angle: number; readonly piece: Piece }[];
  /** The legs that hold the axle up. */
  readonly legs: readonly Piece[];
};

/** A Ferris wheel facing the shore, its rim lit in alternating pink and cyan neon. */
function placeWheel(): Wheel {
  const turning: Piece[] = [];
  const segment = (2 * Math.PI * WHEEL_RADIUS) / WHEEL_RIM;
  for (let i = 0; i < WHEEL_RIM; i++) {
    const angle = (i / WHEEL_RIM) * Math.PI * 2;
    const at: Vec3 = [Math.cos(angle) * WHEEL_RADIUS, Math.sin(angle) * WHEEL_RADIUS, 0];
    const neon = i % 2 === 0 ? NEON_PINK : NEON_CYAN;
    turning.push(piece(at, [0.35, segment + 0.1, 0.35], RAIL, turnAbout([0, 0, 1], angle), neon));
  }
  for (let i = 0; i < WHEEL_CARS; i++) {
    const angle = (i / WHEEL_CARS) * Math.PI * 2;
    const half = WHEEL_RADIUS / 2;
    turning.push(
      piece(
        [Math.cos(angle) * half, Math.sin(angle) * half, 0],
        [0.12, WHEEL_RADIUS, 0.12],
        RAIL,
        turnAbout([0, 0, 1], angle - Math.PI / 2),
      ),
    );
  }
  turning.push(piece([0, 0, 0], [1, 1, 1.2], POST));
  const colors: Color[] = [NEON_PINK, NEON_CYAN, [1, 0.8, 0.3], RAIL];
  const cars = Array.from({ length: WHEEL_CARS }, (_, i) => ({
    angle: (i / WHEEL_CARS) * Math.PI * 2,
    piece: piece([0, -0.9, 0], [1.4, 1.2, 1.2], colors[i % colors.length]),
  }));
  const legs: Piece[] = [];
  for (const side of [-1, 1]) {
    for (const lean of [-1, 1]) {
      const height = WHEEL_AXLE[1];
      legs.push(
        piece(
          [lean * 2.2, height / 2, WHEEL_AXLE[2] + side * 1.1],
          [0.3, height / Math.cos(0.42), 0.3],
          RAIL,
          turnAbout([0, 0, 1], lean * 0.42),
        ),
      );
    }
  }
  return { axle: WHEEL_AXLE, radius: WHEEL_RADIUS, turning, cars, legs };
}

// ---- Promenade lamps ---------------------------------------------------------------------

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

function placePromenadeLamps(lamps: Lamp[], posts: Post[]) {
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

// ---- Lighthouse --------------------------------------------------------------------------

const TOWER_WHITE: Color = [0.93, 0.92, 0.88];
const TOWER_RED: Color = [0.78, 0.16, 0.12];
const LANTERN: Color = [1, 0.92, 0.7];

/** Where the lighthouse's lamp burns, and where its beams start. */
export const BEACON: Vec3 = [ISLET.x, groundAt(ISLET.x, ISLET.z) + 22.7, ISLET.z];

/**
 * A lighthouse on the islet: a tapering tower in red and white bands, a dark gallery, a glazed
 * lantern room with its lamp, and a red cap.
 */
function placeLighthouse(lamps: Lamp[], pieces: Piece[]) {
  const foot = groundAt(ISLET.x, ISLET.z) - 0.3;
  const bands = 6;
  const band = 3.4;
  pieces.push(piece([ISLET.x, foot + 0.5, ISLET.z], [5.4, 1, 5.4], [0.55, 0.52, 0.48]));
  for (let i = 0; i < bands; i++) {
    const width = 4 - i * 0.32;
    pieces.push(
      piece(
        [ISLET.x, foot + 1 + band * (i + 0.5), ISLET.z],
        [width, band, width],
        i % 2 === 0 ? TOWER_WHITE : TOWER_RED,
        turnAbout([0, 1, 0], Math.PI / 4),
      ),
    );
  }
  const top = foot + 1 + band * bands;
  pieces.push(piece([ISLET.x, top + 0.2, ISLET.z], [3.6, 0.4, 3.6], POST));
  pieces.push(piece([ISLET.x, BEACON[1], ISLET.z], [1.8, 2.4, 1.8], LANTERN, IDENTITY, LANTERN));
  pieces.push(
    piece(
      [ISLET.x, BEACON[1] + 1.6, ISLET.z],
      [2.2, 0.8, 2.2],
      TOWER_RED,
      turnAbout([0, 1, 0], Math.PI / 4),
    ),
  );
  lamps.push({ light: [ISLET.x, BEACON[1], ISLET.z] });
}

// ---- Palms -------------------------------------------------------------------------------

export type Palm = {
  readonly slot: number;
  /** The foot of the trunk, which the palm sways and falls about. */
  readonly foot: Vec3;
  readonly height: number;
  readonly pieces: readonly Piece[];
};

const BARK: Color = [0.42, 0.34, 0.26];
const LEAVES: readonly Color[] = [
  [0.16, 0.42, 0.14],
  [0.22, 0.48, 0.16],
  [0.14, 0.36, 0.12],
];
const NUTS: Color = [0.35, 0.24, 0.12];

/** A trunk that curves as it rises, crowned with drooping fronds. */
function palmPieces(height: number, lean: number, heading: number, random: () => number): Piece[] {
  const pieces: Piece[] = [];
  const segments = 7;
  const step = height / segments;
  const yaw = turnAbout([0, 1, 0], heading);
  let point: Vec3 = [0, 0, 0];
  let tilt = 0;
  for (let i = 0; i < segments; i++) {
    // The trunk bends more toward the top, as a palm does that has grown toward the light
    tilt = lean * ((i + 1) / segments) ** 1.5;
    const turn = multiply(yaw, turnAbout([1, 0, 0], tilt));
    const half = rotate(turn, [0, step / 2, 0]);
    const centre: Vec3 = [point[0] + half[0], point[1] + half[1], point[2] + half[2]];
    const width = 0.5 - (0.2 * i) / segments;
    pieces.push(piece(centre, [width, step * 1.05, width], BARK, turn));
    point = [centre[0] + half[0], centre[1] + half[1], centre[2] + half[2]];
  }
  const fronds = 8;
  const color = LEAVES[Math.floor(random() * LEAVES.length)];
  for (let i = 0; i < fronds; i++) {
    const around = (i / fronds) * Math.PI * 2 + random() * 0.4;
    const droop = 0.35 + random() * 0.45;
    const length = 3 + random() * 1.2;
    const turn = multiply(turnAbout([0, 1, 0], around), turnAbout([1, 0, 0], Math.PI / 2 + droop));
    const reach = rotate(turn, [0, length / 2, 0]);
    pieces.push(
      piece(
        [point[0] + reach[0], point[1] + reach[1], point[2] + reach[2]],
        [0.9, length, 0.06],
        color,
        turn,
      ),
    );
  }
  pieces.push(piece([point[0], point[1] - 0.35, point[2]], [0.6, 0.5, 0.6], NUTS));
  return pieces;
}

function placePalms(random: () => number) {
  const palms: Palm[] = [];
  for (let x = -92; x <= 92; x += 7 + random() * 5) {
    if (Math.abs(x - PIER_X) < 6) continue;
    const z = PROMENADE.near - 2.5 - random() * 6;
    const height = 7 + random() * 4;
    const lean = 0.12 + random() * 0.3;
    // Palms on a beach lean out toward the sea, -z, give or take
    const heading = Math.PI + (random() - 0.5) * 1.6;
    palms.push({
      slot: palms.length,
      foot: [x, groundAt(x, z) - 0.1, z],
      height,
      pieces: palmPieces(height, lean, heading, random),
    });
  }
  return palms;
}

/** A palm the flood tore out by its roots: where it floats, how it moves and turns. */
export type Drift = {
  /**
   * Rooted where it grew, afloat on the current, stranded where the water left it, or gone off
   * the edge of the map with the water.
   */
  mode: "rooted" | "afloat" | "stranded" | "gone";
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  yaw: number;
  spin: number;
  /** Whether the flood has already had its one chance to tear this palm out. */
  tried: boolean;
};

/** Share of fallen palms in deep, fast water that the flood tears out by the roots. */
const UPROOT = 0.75;
/** Water deeper and faster than this, in metres and metres per second, can tear a palm out. */
const TEARING_DEPTH = 1;
const TEARING_SPEED = 2;
/** Water a log needs to float, and how fast it takes up the current. */
const FLOAT_DEPTH = 0.5;
const GRIP = 0.8;
/** Past this far from the centre, a floating log has left the map. */
const EDGE = 98;

/**
 * Some of the palms the flood knocks down it also tears out and carries off. A torn palm floats
 * as a log with the current, turning slowly, stops against buildings and walls, and lies where
 * the water leaves it until the water comes back for it.
 */
export function createDrift(palms: readonly Palm[], random: () => number) {
  const fresh = (palm: Palm): Drift => ({
    mode: "rooted",
    x: palm.foot[0],
    y: palm.foot[1],
    z: palm.foot[2],
    vx: 0,
    vz: 0,
    yaw: 0,
    spin: 0,
    tried: false,
  });
  const states = palms.map(fresh);

  return {
    states,

    /**
     * Moves one palm by the water at its place: level, depth, then current along x and z.
     * `blocked` says where buildings and walls stand.
     */
    update(
      index: number,
      fallen: boolean,
      water: ArrayLike<number>,
      dt: number,
      blocked: (x: number, z: number) => boolean,
    ) {
      const state = states[index];
      if (state.mode === "gone") return;
      const [level, depth, flowX, flowZ] = [water[0], water[1], water[2], water[3]];
      const speed = Math.hypot(flowX, flowZ);
      if (state.mode === "rooted") {
        if (!fallen || state.tried || depth < TEARING_DEPTH || speed < TEARING_SPEED) return;
        state.tried = true;
        if (random() < UPROOT) state.mode = "afloat";
        return;
      }
      if (depth < FLOAT_DEPTH) {
        state.mode = "stranded";
        state.vx = state.vz = state.spin = 0;
        state.y = level - depth;
        return;
      }
      state.mode = "afloat";
      const take = Math.min(1, dt * GRIP);
      state.vx += (flowX - state.vx) * take;
      state.vz += (flowZ - state.vz) * take;
      if (blocked(state.x + state.vx * dt * 3, state.z)) state.vx = -state.vx * 0.3;
      if (blocked(state.x, state.z + state.vz * dt * 3)) state.vz = -state.vz * 0.3;
      // The map's edge is open water: a log that reaches it floats away
      state.x += state.vx * dt;
      state.z += state.vz * dt;
      if (Math.abs(state.x) > EDGE || Math.abs(state.z) > EDGE) {
        state.mode = "gone";
        return;
      }
      state.y += (level - 0.3 - state.y) * Math.min(1, dt * 4);
      state.spin += (random() - 0.5) * speed * dt * 0.8;
      state.spin *= 1 - dt * 0.5;
      state.yaw += state.spin * dt;
    },

    reset() {
      palms.forEach((palm, i) => (states[i] = fresh(palm)));
    },
  };
}

// ---- Boats and buoys ---------------------------------------------------------------------

/** What floats: a motor boat, a sailing boat or a buoy. */
export const MOTORBOAT = 0;
export const SAILBOAT = 1;
export const BUOY = 2;

export type Mooring = {
  readonly kind: number;
  /** Where its anchor holds, and how far its rope lets it swing. */
  readonly anchor: readonly [number, number];
  readonly rope: number;
  readonly heading: number;
};

function placeMoorings(random: () => number) {
  const moorings: Mooring[] = [];
  // Boats tied up along both sides of the pier's neck
  for (let z = -52; z >= -80; z -= 7) {
    for (const side of [-1, 1]) {
      if (random() < 0.25) continue;
      moorings.push({
        kind: random() < 0.6 ? MOTORBOAT : SAILBOAT,
        anchor: [PIER_X + side * 6.5, z],
        rope: 1.5,
        heading: random() * Math.PI * 2,
      });
    }
  }
  // Boats at anchor out in the bay
  for (let i = 0; i < 12; i++) {
    const x = -85 + random() * 170;
    if (Math.abs(x - PIER_X) < 14 || Math.abs(x - ISLET.x) < ISLET.radius + 8) continue;
    moorings.push({
      kind: random() < 0.5 ? MOTORBOAT : SAILBOAT,
      anchor: [x, -76 - random() * 18],
      rope: 4 + random() * 3,
      heading: random() * Math.PI * 2,
    });
  }
  // A line of buoys marking where swimmers may go, and a pair marking the pier's head
  for (let x = -84; x <= 6; x += 7.5) {
    moorings.push({ kind: BUOY, anchor: [x, -66], rope: 0.6, heading: 0 });
  }
  for (const side of [-1, 1]) {
    moorings.push({ kind: BUOY, anchor: [PIER_X + side * 13, -95], rope: 0.6, heading: 0 });
  }
  return moorings;
}

export type Beach = {
  readonly spans: readonly Span[];
  readonly lamps: readonly Lamp[];
  /** Fixed pieces that belong to nothing that falls: the lighthouse. */
  readonly pieces: readonly Piece[];
  /** The promenade's lamp posts and the arch onto the pier, which the flood can knock over. */
  readonly posts: readonly Post[];
  readonly palms: readonly Palm[];
  readonly moorings: readonly Mooring[];
  /** The Ferris wheel, which stands on the pier's head span, the last. */
  readonly wheel: Wheel;
};

export function createBeach(random: () => number): Beach {
  const pier = placePier();
  const lamps = [...pier.lamps];
  const pieces = [...pier.pieces];
  const posts: Post[] = [pier.gate];
  placePromenadeLamps(lamps, posts);
  placeLighthouse(lamps, pieces);
  return {
    spans: pier.spans,
    lamps,
    pieces,
    posts,
    palms: placePalms(random),
    moorings: placeMoorings(random),
    wheel: placeWheel(),
  };
}
