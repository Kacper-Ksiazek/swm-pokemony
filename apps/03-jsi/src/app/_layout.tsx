import { useLayoutEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { setupJsiBindings } from "kksiazek-jsi";
import { theme } from "@/components/theme";

type JsiInitState = {
  ready: boolean;
  error: string | null;
};

export default function RootLayout() {
  const [jsiState, setJsiState] = useState<JsiInitState>({
    ready: false,
    error: null,
  });

  useLayoutEffect(() => {
    try {
      setupJsiBindings();
      setJsiState({ ready: true, error: null });
    } catch (err) {
      setJsiState({
        ready: false,
        error: err instanceof Error ? err.message : "JSI setup failed.",
      });
    }
  }, []);

  if (jsiState.error) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>JSI setup failed</Text>
          <Text style={styles.error}>{jsiState.error}</Text>
        </View>
      </View>
    );
  }

  if (!jsiState.ready) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.accent,
        headerTitleStyle: { color: theme.colors.textPrimary },
        contentStyle: { backgroundColor: theme.colors.background },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "JSI Workshop" }} />
      <Stack.Screen name="globals" options={{ title: "Globals" }} />
      <Stack.Screen name="counter" options={{ title: "Counter" }} />
      <Stack.Screen name="math-functions" options={{ title: "Math functions" }} />
      <Stack.Screen name="divide" options={{ title: "Divide" }} />
      <Stack.Screen name="array-map" options={{ title: "Array Map" }} />
      <Stack.Screen name="strings" options={{ title: "Strings" }} />
      <Stack.Screen name="date" options={{ title: "Date" }} />
      <Stack.Screen name="infinity" options={{ title: "Infinity" }} />
      <Stack.Screen name="sum-object" options={{ title: "Sum Object" }} />
      <Stack.Screen name="native-state" options={{ title: "Native State" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorCard: {
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    borderRadius: theme.radius.lg + 2,
    padding: 16,
    gap: 6,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.danger,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFE4E6",
  },
});
