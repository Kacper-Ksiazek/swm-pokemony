import { Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { theme } from "./theme";

export const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

/** Shared page chrome for every exercise: scroll body inside safe area. */
export function DemoScreen({
  keyboardShouldPersistTaps = "handled",
  children,
}: {
  keyboardShouldPersistTaps?: "handled" | "always" | "never";
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 18,
    flex: 1,
  },
});
