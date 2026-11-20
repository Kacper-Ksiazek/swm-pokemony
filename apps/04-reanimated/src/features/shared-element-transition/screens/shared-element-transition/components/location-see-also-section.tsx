import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { router } from "expo-router";

import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { getOtherPokemonLocations, type PokemonLocation } from "../data";
import { LocationSharedImage } from "./shared-location-elements";

type LocationSeeAlsoSectionProps = {
  currentId: string;
};

export function LocationSeeAlsoSection({ currentId }: LocationSeeAlsoSectionProps) {
  const locations = getOtherPokemonLocations(currentId);

  if (locations.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn.delay(200).duration(350)} style={styles.section}>
      <Text style={styles.sectionTitle}>See also</Text>

      <View style={styles.list}>
        {locations.map((location) => (
          <SeeAlsoRow key={location.id} location={location} />
        ))}
      </View>
    </Animated.View>
  );
}

function SeeAlsoRow({ location }: { location: PokemonLocation }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => router.push(`/shared-element-transition/${location.id}`)}
    >
      <View style={styles.thumbnail}>
        <LocationSharedImage location={location} variant="compact" />
      </View>

      <View style={styles.copy}>
        <Text style={styles.name}>{location.name}</Text>
        <Text style={styles.region}>{location.region}</Text>
      </View>

      <IconSymbol name="chevron.right" size={14} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: theme.colors.textSecondary,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
  },
  rowPressed: {
    opacity: 0.92,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  region: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    color: theme.colors.textSecondary,
  },
});
