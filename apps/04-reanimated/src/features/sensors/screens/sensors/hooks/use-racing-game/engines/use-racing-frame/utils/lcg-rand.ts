import type { LcgRand } from "../use-racing-frame.types";

const LCG_MULT = 1664525;
const LCG_INC = 1013904223;
const LCG_MOD = 4294967296;

/** Mutable LCG stream for traffic spawn randomness within one frame. */
export function createLcgRand(initialSeed: number): LcgRand {
  "worklet";

  const state = { seed: initialSeed };

  const next = () => {
    state.seed = (state.seed * LCG_MULT + LCG_INC) % LCG_MOD;

    return state.seed / LCG_MOD;
  };

  const getSeed = () => state.seed;

  return { next, getSeed };
}
