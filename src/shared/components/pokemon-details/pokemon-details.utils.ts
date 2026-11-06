import { capitalize } from "es-toolkit/string";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "SPD",
};

/** Floats from dual-type math may not === object literal keys; compare with epsilon. */
const MULTIPLIER_LABEL_EPSILON = 1e-9;

function multiplierSymbolLabel(multiplier: number): string | null {
  if (Math.abs(multiplier - 0.25) < MULTIPLIER_LABEL_EPSILON) {
    return "×¼";
  }

  if (Math.abs(multiplier - 0.5) < MULTIPLIER_LABEL_EPSILON) {
    return "×½";
  }

  return null;
}

export function formatStatLabel(statName: string): string {
  return STAT_LABELS[statName] ?? statName.toUpperCase();
}

/** PokeAPI names are kebab-case slugs, e.g. `water-1` or `rough-skin`. */
export function formatApiName(name: string): string {
  return capitalize(name.replaceAll("-", " "));
}

/** `generation-iv` → `Gen IV` */
export function formatGeneration(generation: string): string {
  return `Gen ${generation.replace("generation-", "").toUpperCase()}`;
}

export function formatGenderRatio(genderRate: number): string {
  if (genderRate < 0) {
    return "Genderless";
  }

  const female = (genderRate / 8) * 100;

  return `${100 - female}% ♂ · ${female}% ♀`;
}

export function formatMultiplier(multiplier: number): string {
  return multiplierSymbolLabel(multiplier) ?? `×${multiplier}`;
}
