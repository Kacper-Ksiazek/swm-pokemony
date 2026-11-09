import { POKEAPI_BASE_URL } from "../constants";
import type { PokemonDetail } from "../pokemon-api.types";
import { fetchPokemonSpecies } from "./fetch-pokemon-species";
import { fetchTypeMatchups } from "./fetch-type-matchups";

type PokemonDetailResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  species: { url: string };
  types: { slot: number; type: { name: string } }[];
  abilities: { is_hidden: boolean; ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${id}`);

  if (!response.ok) {
    throw new Error(`PokeAPI responded with ${response.status}`);
  }

  const data = (await response.json()) as PokemonDetailResponse;
  const typeNames = data.types.map((entry) => entry.type.name);

  const [species, typeMatchups] = await Promise.allSettled([
    fetchPokemonSpecies(data.species.url),
    fetchTypeMatchups(typeNames),
  ]);

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
    species: species.status === "fulfilled" ? species.value : null,
    typeMatchups: typeMatchups.status === "fulfilled" ? typeMatchups.value : null,
  };
}
