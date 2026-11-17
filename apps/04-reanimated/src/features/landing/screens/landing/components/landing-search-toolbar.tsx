import { StyleSheet, TextInput, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle } from "react-native-reanimated";
import { useAnimatedKeyboard } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { ExerciseFilterPicker } from "./exercise-filter-picker";
import type { ExerciseFilter } from "../landing-data";

type LandingSearchToolbarProps = {
  query: string;
  onChangeQuery: (value: string) => void;
  filter: ExerciseFilter;
  onChangeFilter: (value: ExerciseFilter) => void;
};

export function LandingSearchToolbar({
  query,
  onChangeQuery,
  filter,
  onChangeFilter,
}: LandingSearchToolbarProps) {
  const keyboard = useAnimatedKeyboard();
  const insets = useSafeAreaInsets();

  const panelAnimatedStyle = useAnimatedStyle(() => {
    const offset = Math.max(0, keyboard.height.get() - insets.bottom);
    return {
      transform: [{ translateY: -offset }],
    };
  });

  const searchFieldAnimatedStyle = useAnimatedStyle(() => {
    const height = keyboard.height.get();
    return {
      borderColor: interpolateColor(
        height,
        [0, 60],
        [theme.colors.cardBorder, theme.colors.accent],
      ),
    };
  });

  return (
    <Animated.View
      style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 10) }, panelAnimatedStyle]}
    >
      <View style={styles.row}>
        <Animated.View style={[styles.searchField, searchFieldAnimatedStyle]}>
          <IconSymbol name="magnifyingglass" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Szukaj ćwiczenia…"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </Animated.View>
        <ExerciseFilterPicker value={filter} onChange={onChangeFilter} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    padding: 0,
  },
});
