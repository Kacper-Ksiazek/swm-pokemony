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
