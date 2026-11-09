import { POKEAPI_BASE_URL } from "../constants";
import type { PokemonListItem, PokemonListResponse, PokemonListResult } from "../pokemon-api.types";

const POKEMON_LIST_PAGE_SIZE = 20;

export async function fetchPokemonListPage(offset: number): Promise<{
  items: PokemonListItem[];
  nextOffset: number | null;
}> {
  const response = await fetch(
    `${POKEAPI_BASE_URL}/pokemon?limit=${POKEMON_LIST_PAGE_SIZE}&offset=${offset}`,
  );

  if (!response.ok) {
    throw new Error(`PokeAPI responded with ${response.status}`);
  }

  const data = (await response.json()) as PokemonListResponse;
  const items = data.results.map(parsePokemonListItem);

  const nextOffset = data.next ? offset + POKEMON_LIST_PAGE_SIZE : null;

  return { items, nextOffset };
}

function parsePokemonListItem(result: PokemonListResult): PokemonListItem {
  return {
    ...result,
    id: Number.parseInt(result.url.match(/\/pokemon\/(\d+)/)?.[1] ?? "", 10),
  };
}
