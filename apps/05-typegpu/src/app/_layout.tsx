import "react-native-reanimated";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          orientation: "portrait",
          headerBackButtonDisplayMode: "minimal",
          headerTintColor: "#E63946",
          contentStyle: { backgroundColor: "#EAF4FB" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="setup/[player]" options={{ title: "Gracz" }} />
        <Stack.Screen name="game" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
