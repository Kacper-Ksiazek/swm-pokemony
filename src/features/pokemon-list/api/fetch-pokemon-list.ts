import type { PokemonListItem, PokemonListResponse } from "./types";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

export const POKEMON_LIST_PAGE_SIZE = 20;

export function parsePokemonIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`Invalid pokemon URL: ${url}`);
  }
  return Number.parseInt(match[1], 10);
}

export function pokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export async function fetchPokemonListPage(offset: number): Promise<{
  items: PokemonListItem[];
  nextOffset: number | null;
}> {
  const response = await fetch(
    `${POKEAPI_BASE}/pokemon?limit=${POKEMON_LIST_PAGE_SIZE}&offset=${offset}`,
  );

  if (!response.ok) {
    throw new Error(`PokeAPI responded with ${response.status}`);
  }

  const data = (await response.json()) as PokemonListResponse;
  const items = data.results.map((result) => ({
    ...result,
    id: parsePokemonIdFromUrl(result.url),
  }));

  const nextOffset = data.next ? offset + POKEMON_LIST_PAGE_SIZE : null;

  return { items, nextOffset };
}
