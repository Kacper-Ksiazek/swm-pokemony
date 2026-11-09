import type { PokemonSpecies } from "../pokemon-api.types";

const LANGUAGE = "en";

type NamedResource = { name: string };

type PokemonSpeciesResponse = {
  capture_rate: number;
  gender_rate: number;
  is_legendary: boolean;
  is_mythical: boolean;
  generation: NamedResource;
  habitat: NamedResource | null;
  egg_groups: NamedResource[];
  genera: { genus: string; language: NamedResource }[];
  flavor_text_entries: { flavor_text: string; language: NamedResource }[];
};

/** Takes the `species.url` from `/pokemon`, because form ids (10000+) differ from species ids. */
export async function fetchPokemonSpecies(speciesUrl: string): Promise<PokemonSpecies> {
  const response = await fetch(speciesUrl);

  if (!response.ok) {
    throw new Error(`PokeAPI responded with ${response.status}`);
  }

  const data = (await response.json()) as PokemonSpeciesResponse;
  const genus = data.genera.find((entry) => entry.language.name === LANGUAGE)?.genus ?? null;
  const flavorText = lastFlavorTextInLanguage(data.flavor_text_entries, LANGUAGE);

  return {
    genus,
    flavorText: flavorText !== undefined ? cleanFlavorText(flavorText) : null,
    generation: data.generation.name,
    habitat: data.habitat?.name ?? null,
    captureRate: data.capture_rate,
    genderRate: data.gender_rate,
    eggGroups: data.egg_groups.map((group) => group.name),
    isLegendary: data.is_legendary,
    isMythical: data.is_mythical,
  };
}

/** Latest English entry; avoid `Array.prototype.findLast` for older runtimes. */
function lastFlavorTextInLanguage(
  entries: { flavor_text: string; language: NamedResource }[],
  language: string,
): string | undefined {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];

    if (entry.language.name === language) {
      return entry.flavor_text;
    }
  }

  return undefined;
}

/** Game text carries hard line breaks and form feeds sized for the original screens. */
function cleanFlavorText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
