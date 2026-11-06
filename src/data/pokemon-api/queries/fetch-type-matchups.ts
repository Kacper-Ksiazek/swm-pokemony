import { POKEAPI_BASE_URL } from "../constants";
import type { PokemonTypeMatchup, PokemonTypeMatchups } from "../pokemon-api.types";

type NamedResource = { name: string };

type TypeResponse = {
  damage_relations: {
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
};

/**
 * Defensive matchups for a Pokémon with the given types.
 * Dual types multiply: Grass/Poison takes 0.5 × 0.5 = ×¼ from Grass and 0.5 × 2 = ×1 from Ground.
 */
export async function fetchTypeMatchups(typeNames: string[]): Promise<PokemonTypeMatchups> {
  const relations = await Promise.all(typeNames.map(fetchDamageRelations));
  const multipliers = new Map<string, number>();

  function apply(attackingTypes: NamedResource[], factor: number) {
    for (const { name } of attackingTypes) {
      multipliers.set(name, (multipliers.get(name) ?? 1) * factor);
    }
  }

  for (const relation of relations) {
    apply(relation.double_damage_from, 2);
    apply(relation.half_damage_from, 0.5);
    apply(relation.no_damage_from, 0);
  }

  const matchups: PokemonTypeMatchup[] = [...multipliers]
    .map(([type, multiplier]) => ({ type, multiplier }))
    .sort((a, b) => b.multiplier - a.multiplier);

  return {
    weakTo: matchups.filter((matchup) => matchup.multiplier > 1),
    resists: matchups.filter((matchup) => matchup.multiplier > 0 && matchup.multiplier < 1),
    immuneTo: matchups.filter((matchup) => matchup.multiplier === 0).map((matchup) => matchup.type),
  };
}

async function fetchDamageRelations(typeName: string): Promise<TypeResponse["damage_relations"]> {
  const response = await fetch(`${POKEAPI_BASE_URL}/type/${typeName}`);

  if (!response.ok) {
    throw new Error(`PokeAPI responded with ${response.status}`);
  }

  const data = (await response.json()) as TypeResponse;

  return data.damage_relations;
}
