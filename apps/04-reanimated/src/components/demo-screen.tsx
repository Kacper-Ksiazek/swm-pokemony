import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { theme } from "./theme";

export const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

/** Shared page chrome for every exercise. Turn scroll off when a gesture owns the screen. */
export function DemoScreen({
  keyboardShouldPersistTaps = "handled",
  scroll = true,
  fullWidth = false,
  immersive = false,
  children,
}: {
  keyboardShouldPersistTaps?: "handled" | "always" | "never";
  scroll?: boolean;
  fullWidth?: boolean;
  /** No header above: respect the top safe area and drop the bottom padding. */
  immersive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={immersive ? ["top"] : ["left", "right"]}>
      <StatusBar style="dark" />

      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            fullWidth && styles.fullWidth,
            immersive && styles.immersive,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[styles.content, fullWidth && styles.fullWidth, immersive && styles.immersive]}
        >
          {children}
        </View>
      )}
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
  fullWidth: {
    paddingHorizontal: 0,
  },
  immersive: {
    paddingBottom: 0,
  },
});
