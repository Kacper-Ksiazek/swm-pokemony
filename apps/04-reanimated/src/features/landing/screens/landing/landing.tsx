import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { theme } from "@/components/theme";

import { ExerciseListItem } from "./components/exercise-list-item";
import { LandingSearchToolbar } from "./components/landing-search-toolbar";
import { DEMO_SECTIONS, filterDemoItems, type ExerciseFilter } from "./landing-data";

export { DEMO_SECTIONS } from "./landing-data";

const EMPTY_ENTER = FadeIn.duration(200);
const EMPTY_EXIT = FadeOut.duration(140);

export function LandingScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ExerciseFilter>("all");

  const items = DEMO_SECTIONS.flatMap((section) => section.items);
  const filteredItems = filterDemoItems(items, query, filter);

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "top"]}>
      <StatusBar style="dark" />
      <View style={styles.listFrame}>
        <ScrollView
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            {filteredItems.length === 0 ? (
              <Animated.View
                key="exercise-list-empty"
                entering={EMPTY_ENTER}
                exiting={EMPTY_EXIT}
                style={styles.empty}
              >
                <Text style={styles.emptyTitle}>Brak wyników</Text>
                <Text style={styles.emptyBody}>Zmień frazę wyszukiwania albo filtr statusu.</Text>
              </Animated.View>
            ) : (
              filteredItems.map((item, index) => (
                <ExerciseListItem key={item.title} item={item} index={index} />
              ))
            )}
          </View>
        </ScrollView>
      </View>
      <LandingSearchToolbar
        query={query}
        onChangeQuery={setQuery}
        filter={filter}
        onChangeFilter={setFilter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listFrame: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  empty: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg + 2,
    padding: 20,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textHeading,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
});
