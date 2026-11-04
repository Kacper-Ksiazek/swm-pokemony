import { capitalize } from "es-toolkit/string";
import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "index",
};

function detailTitle(name: unknown): string {
  if (typeof name !== "string" || name.length === 0) {
    return "Pokémon";
  }

  return capitalize(name);
}

export default function PokemonFavoriteLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          title: detailTitle(
            route.params !== undefined && "name" in route.params ? route.params.name : undefined,
          ),
          headerBackButtonDisplayMode: "minimal",
        })}
      />
    </Stack>
  );
}
