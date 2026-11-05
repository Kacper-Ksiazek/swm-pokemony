import { POKEAPI_BASE_URL } from "../constants";
import type { PokemonDetail } from "../pokemon-api.types";

type PokemonDetailResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{ slot: number; type: { name: string } }>;
  abilities: Array<{ is_hidden: boolean; ability: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
};

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${id}`);

  if (!response.ok) {
    throw new Error(`PokeAPI responded with ${response.status}`);
  }

  const data = (await response.json()) as PokemonDetailResponse;

  return {
    id: data.id,
    name: data.name,
    heightM: data.height / 10,
    weightKg: data.weight / 10,
    types: data.types.map((entry) => ({
      slot: entry.slot,
      name: entry.type.name,
    })),
    abilities: data.abilities.map((entry) => ({
      name: entry.ability.name,
      isHidden: entry.is_hidden,
    })),
    stats: data.stats.map((entry) => ({
      name: entry.stat.name,
      baseStat: entry.base_stat,
    })),
  };
}
