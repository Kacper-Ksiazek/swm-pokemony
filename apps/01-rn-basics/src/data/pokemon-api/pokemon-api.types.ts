export type PokemonListResult = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListResult[];
};

export type PokemonListItem = PokemonListResult & {
  id: number;
};

export type PokemonTypeSlot = {
  slot: number;
  name: string;
};

export type PokemonAbility = {
  name: string;
  isHidden: boolean;
};

export type PokemonStat = {
  name: string;
  baseStat: number;
};

export type PokemonSpecies = {
  genus: string | null;
  flavorText: string | null;
  generation: string;
  habitat: string | null;
  captureRate: number;
  /** Chance of being female in eighths; -1 means genderless. */
  genderRate: number;
  eggGroups: string[];
  isLegendary: boolean;
  isMythical: boolean;
};

export type PokemonTypeMatchup = {
  type: string;
  multiplier: number;
};

export type PokemonTypeMatchups = {
  weakTo: PokemonTypeMatchup[];
  resists: PokemonTypeMatchup[];
  immuneTo: string[];
};

export type PokemonDetail = {
  id: number;
  name: string;
  heightM: number;
  weightKg: number;
  types: PokemonTypeSlot[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  /** `null` when the follow-up request failed; the base data is still usable. */
  species: PokemonSpecies | null;
  /** `null` when the follow-up request failed; the base data is still usable. */
  typeMatchups: PokemonTypeMatchups | null;
};
