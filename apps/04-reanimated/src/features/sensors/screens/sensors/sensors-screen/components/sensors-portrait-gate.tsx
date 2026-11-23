import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { VICE_COLORS } from "../../constants";

export function SensorsPortraitGate() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Wróć"
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8, left: Math.max(12, insets.left + 8) }]}
      >
        <IconSymbol name="chevron.left" size={18} color={VICE_COLORS.cyan} />
        <Text style={styles.backButtonText}>Wróć</Text>
      </Pressable>

      <ActivityIndicator size="large" color={VICE_COLORS.cyan} />
      <Text style={styles.title}>Obróć telefon poziomo</Text>
      <Text style={styles.subtitle}>
        Wyścig startuje w orientacji poziomej. Jeśli masz blokadę obrotu, wyłącz ją w centrum
        sterowania.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 16,
  },
  backButton: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 1,
  },
  backButtonText: {
    color: VICE_COLORS.cyan,
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
