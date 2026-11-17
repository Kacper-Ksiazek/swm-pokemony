import "react-native-reanimated";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { theme } from "@/components/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.accent,
            headerTitleStyle: { color: theme.colors.textPrimary },
            contentStyle: { backgroundColor: theme.colors.background },
            headerBackButtonDisplayMode: "minimal",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="stars-2d" options={{ title: "Stars 2D" }} />
          <Stack.Screen name="svg-circle" options={{ title: "SVG circle" }} />
          <Stack.Screen name="stars-3d" options={{ headerShown: false }} />
          <Stack.Screen name="physics-ball" options={{ title: "Physics ball" }} />
          <Stack.Screen name="keyboard-handler" options={{ title: "Keyboard handler" }} />
          <Stack.Screen name="scroll-onboarding" options={{ title: "Scroll onboarding" }} />
          <Stack.Screen name="sensors" options={{ title: "Sensors" }} />
          <Stack.Screen name="shared-element-transition" options={{ title: "Shared transition" }} />
          <Stack.Screen name="skia" options={{ title: "Skia" }} />
          <Stack.Screen name="chess" options={{ title: "Chess" }} />
        </Stack>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
