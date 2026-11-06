import { POKEAPI_BASE_URL } from "../constants";
import type { PokemonTypeMatchup, PokemonTypeMatchups } from "../pokemon-api.types";

type NamedResource = { name: string };

type DamageRelations = {
  double_damage_from: NamedResource[];
  half_damage_from: NamedResource[];
  no_damage_from: NamedResource[];
};

type TypeResponse = {
  damage_relations: DamageRelations;
};

/**
 * Defensive matchups for a Pokémon with the given defending types.
 *
 * For each attacking type T, combined effectiveness is the **product** of the factor from each
 * defending type (0, ½, 1, or 2). Immunity (0) from either type zeros the product. Same as the
 * main-series chart (e.g. Fire/Flying: Ground is 2× against Fire but immune vs Flying → 2×0 = immune).
 */
export async function fetchTypeMatchups(typeNames: string[]): Promise<PokemonTypeMatchups> {
  const relationSets = await Promise.all(typeNames.map(fetchDamageRelations));
  const attackingTypes = collectAttackingTypes(relationSets);
  const multipliers = new Map<string, number>();

  for (const attackingName of attackingTypes) {
    let combined = 1;

    for (const relations of relationSets) {
      combined *= defensiveFactorForAttackingType(relations, attackingName);
      if (combined === 0) {
        break;
      }
    }

    multipliers.set(attackingName, combined);
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

function defensiveFactorForAttackingType(
  relations: DamageRelations,
  attackingType: string,
): number {
  if (relations.no_damage_from.some((entry) => entry.name === attackingType)) {
    return 0;
  }

  if (relations.double_damage_from.some((entry) => entry.name === attackingType)) {
    return 2;
  }

  if (relations.half_damage_from.some((entry) => entry.name === attackingType)) {
    return 0.5;
  }

  return 1;
}

function collectAttackingTypes(relationSets: DamageRelations[]): Set<string> {
  const names = new Set<string>();

  for (const relations of relationSets) {
    for (const { name } of relations.double_damage_from) {
      names.add(name);
    }
    for (const { name } of relations.half_damage_from) {
      names.add(name);
    }
    for (const { name } of relations.no_damage_from) {
      names.add(name);
    }
  }

  return names;
}

async function fetchDamageRelations(typeName: string): Promise<DamageRelations> {
  const response = await fetch(`${POKEAPI_BASE_URL}/type/${typeName}`);

  if (!response.ok) {
    throw new Error(`PokeAPI responded with ${response.status}`);
  }

  const data = (await response.json()) as TypeResponse;

  return data.damage_relations;
}
