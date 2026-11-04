import { Stack } from "expo-router";

export default function PokemonListLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "List" }} />
    </Stack>
  );
}
