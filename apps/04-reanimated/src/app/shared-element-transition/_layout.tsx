import { Stack } from "expo-router";

import { theme } from "@/components/theme";
import { getPokemonLocation } from "@/features/shared-element-transition/screens/shared-element-transition/data";

export const unstable_settings = {
  anchor: "index",
};

export default function SharedElementTransitionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Shared transition" }} />

      <Stack.Screen
        name="[id]"
        options={({ route }) => {
          const params = route.params as { id?: string } | undefined;
          const id = params?.id ?? "";

          return { title: getPokemonLocation(id)?.name ?? "Location" };
        }}
      />
    </Stack>
  );
}
