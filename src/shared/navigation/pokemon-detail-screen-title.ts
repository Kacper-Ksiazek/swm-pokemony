import { isString } from "es-toolkit/predicate";
import { capitalize } from "es-toolkit/string";

export function stackRouteParamName(params: object | undefined): unknown {
  if (params === undefined || !("name" in params)) {
    return undefined;
  }

  return params.name;
}

export function pokemonDetailScreenTitle(name: unknown): string {
  if (!isString(name) || name.length === 0) {
    return "Pokémon";
  }

  return capitalize(name);
}
