/**
 * When buildings give way, as plain numbers. The GPU measures how hard the water pushes on each
 * building; these rules decide which ones fall and how. No GPU imports.
 */
import type { Building } from "@/world/layout";

/** Height of the heap a fallen building leaves, in metres. */
export const RUBBLE = 1.6;
/** Seconds a fall takes, from the first lean to the heap at rest. */
export const FALL_SECONDS = 1.8;
/** Kilonewtons a building resists per metre of its outline, scaled by how tall it is. */
const STRENGTH_PER_METRE = 2.2;
/** Seconds of overload, counted in multiples of the strength, that bring a building down. */
const ENDURANCE = 0.6;
/** Share of the gathered strain a building sheds each second while the load stays below its strength. */
const RECOVERY = 0.3;

export type Fall = {
  /** Simulated second the fall started. */
  readonly since: number;
  /** Unit direction along the ground that the water pushed it, x then z. */
  readonly toward: readonly [number, number];
};

/**
 * Taller buildings stand on deeper foundations and stiffer frames, so they hold far more than
 * low houses of the same outline.
 */
export function strengthOf(building: Building) {
  const outline = 2 * (building.width + building.depth);
  return STRENGTH_PER_METRE * outline * (0.5 + building.height / 12);
}

/**
 * Tracks the strain on a set of structures, each with its own strength in kilonewtons; a strength
 * of 0 marks an empty slot. The pushes for slot `i` sit at `offset + i` in the readback, as x and
 * z pairs.
 */
export function createCollapse(strengths: Float32Array, offset = 0) {
  const strain = new Float32Array(strengths.length);
  const falls: (Fall | undefined)[] = Array.from(strengths, () => undefined);

  return {
    falls,
    strengths,

    /** Returns the structures that start to fall now. */
    update(push: Float32Array, time: number, dt: number) {
      const fallen: number[] = [];
      for (let i = 0; i < strengths.length; i++) {
        if (falls[i] || strengths[i] === 0) continue;
        const x = push[(offset + i) * 2];
        const z = push[(offset + i) * 2 + 1];
        const load = Math.hypot(x, z) / strengths[i];
        strain[i] =
          load > 1 ? strain[i] + load * dt : Math.max(0, strain[i] - strain[i] * RECOVERY * dt);
        if (strain[i] < ENDURANCE) continue;
        const length = Math.max(Math.hypot(x, z), 1e-6);
        falls[i] = { since: time, toward: [x / length, z / length] };
        fallen.push(i);
      }
      return fallen;
    },

    /** Stands one slot up again with a new strength, or empties it with 0. */
    place(i: number, strength: number) {
      strengths[i] = strength;
      strain[i] = 0;
      falls[i] = undefined;
    },

    reset() {
      strain.fill(0);
      falls.fill(undefined);
    },
  };
}
