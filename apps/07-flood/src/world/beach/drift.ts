import type { Palm } from "./palms";

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
