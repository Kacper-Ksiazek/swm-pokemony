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

export type PokemonDetail = {
  id: number;
  name: string;
  heightM: number;
  weightKg: number;
  types: PokemonTypeSlot[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
};
