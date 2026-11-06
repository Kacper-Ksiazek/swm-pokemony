import { capitalize } from "es-toolkit/string";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "SPD",
};

const MULTIPLIER_LABELS: Record<number, string> = {
  0.25: "×¼",
  0.5: "×½",
};

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
  return MULTIPLIER_LABELS[multiplier] ?? `×${multiplier}`;
}
