import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { SharedTransition, SharedTransitionBoundary } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useIsFocused } from "expo-router";

import { DemoScreen } from "@/components/demo-screen";
import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { POKEMON_LOCATIONS, type PokemonLocation } from "./data";

export function SharedElementTransitionScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  return (
    <SharedTransitionBoundary isActive={isFocused}>
      <DemoScreen>
        <View style={[styles.header, { paddingTop: Math.max(0, insets.top - 12) }]}>
          <Pressable style={styles.backRow} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={16} color={theme.colors.accent} />
            <Text style={styles.backLabel}>Exercises</Text>
          </Pressable>

          <Text style={styles.eyebrow}>Pokémon World Atlas</Text>
          <Text style={styles.heading}>Iconic Locations</Text>
          <Text style={styles.lead}>
            Select a destination card to inspect its details with a shared element transition.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {POKEMON_LOCATIONS.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </ScrollView>
      </DemoScreen>
    </SharedTransitionBoundary>
  );
}

const transition = SharedTransition.duration(450);

function LocationCard({ location }: { location: PokemonLocation }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/shared-element-transition/${location.id}`)}
    >
      <Animated.Image
        sharedTransitionTag={location.id}
        sharedTransitionStyle={transition}
        source={location.image}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.regionPill}>
            <Text style={styles.regionText}>{location.region}</Text>
          </View>
        </View>

        <Text style={styles.title}>{location.name}</Text>
        <Text style={styles.subtitle}>{location.subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginBottom: 8,
  },
  backLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.accent,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: theme.colors.accent,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textHeading,
  },
  lead: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.9,
  },
  image: {
    width: "100%",
    height: 200,
  },
  cardBody: {
    padding: 14,
    gap: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  regionPill: {
    backgroundColor: theme.colors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  regionText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.pillText,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
});
