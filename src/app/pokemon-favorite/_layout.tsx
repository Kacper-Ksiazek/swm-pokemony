import { Stack } from "expo-router";

import {
  pokemonDetailScreenTitle,
  stackRouteParamName,
} from "@/shared/navigation/pokemon-detail-screen-title";

export const unstable_settings = {
  anchor: "index",
};

export default function PokemonFavoriteLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          title: pokemonDetailScreenTitle(stackRouteParamName(route.params)),
          headerBackButtonDisplayMode: "minimal",
        })}
      />
    </Stack>
  );
}
