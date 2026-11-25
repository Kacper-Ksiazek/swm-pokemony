/** Simulation step in seconds. Small enough for a wave 10 m deep on 0.6 m cells. */
export const STEP = 1 / 120;
/** Simulated seconds per real second, so the wave reaches the town while it is still a wave. */
export const PACE = 2;
/**
 * The wave at the sea's edge, in seconds: it climbs to the crest, stays there, then sinks back to
 * calm water. A tsunami is a long wave, so the crest lasts long enough to carry water inland.
 */
const RISE = 2;
const CREST = 4;
const FALL = 6;

export const smooth = (t: number) => t * t * (3 - 2 * t);

/** The sea level at the edge after the wave starts: up to the crest, then back to calm water. */
export function seaLevelAt(seconds: number, crest: number) {
  if (seconds < RISE) return crest * smooth(seconds / RISE);
  if (seconds < RISE + CREST) return crest;

  return crest * (1 - smooth(Math.min((seconds - RISE - CREST) / FALL, 1)));
}
