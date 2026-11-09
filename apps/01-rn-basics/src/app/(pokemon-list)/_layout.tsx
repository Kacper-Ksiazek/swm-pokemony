import { Stack } from "expo-router";

import {
  pokemonDetailScreenTitle,
  stackRouteParamName,
} from "@/shared/navigation/pokemon-detail-screen-title";

export const unstable_settings = {
  anchor: "index",
};

export default function PokemonListLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Pokémon",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="pokemon/[id]"
        options={({ route }) => ({
          title: pokemonDetailScreenTitle(stackRouteParamName(route.params)),
          headerBackButtonDisplayMode: "minimal",
        })}
      />
    </Stack>
  );
}
