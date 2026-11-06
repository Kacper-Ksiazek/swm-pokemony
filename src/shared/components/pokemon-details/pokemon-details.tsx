import { capitalize } from "es-toolkit/string";
import { StyleSheet, Text, View } from "react-native";

import type { PokemonDetail } from "@/data/pokemon-api";
import { ErrorStatusScreen, LoadingStatusScreen } from "@/shared/components/status-screen";
import { COLORS } from "@/shared/styles/colors";

import { formatStatLabel, getPokemonTypeColor } from "./pokemon-details.utils";

type PokemonDetailsProps = {
  detail: PokemonDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function PokemonDetails({ detail, loading, error, onRetry }: PokemonDetailsProps) {
  if (loading) {
    return <LoadingStatusScreen message="Loading details…" />;
  }

  if (error !== null) {
    return <ErrorStatusScreen title="Could not load details" message={error} onRetry={onRetry} />;
  }

  if (detail === null) {
    return null;
  }

  return (
    <View style={styles.sections}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Types</Text>
        <View style={styles.typeRow}>
          {detail.types.map((type) => (
            <View
              key={`${type.slot}-${type.name}`}
              style={[styles.typeBadge, { backgroundColor: getPokemonTypeColor(type.name) }]}
            >
              <Text style={styles.typeLabel}>{capitalize(type.name)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Size</Text>
        <Text style={styles.bodyText}>Height: {detail.heightM.toFixed(1)} m</Text>
        <Text style={styles.bodyText}>Weight: {detail.weightKg.toFixed(1)} kg</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abilities</Text>
        {detail.abilities.map((ability) => (
          <Text key={ability.name} style={styles.bodyText}>
            {capitalize(ability.name.replaceAll("-", " "))}
            {ability.isHidden ? " (hidden)" : ""}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Base stats</Text>
        {detail.stats.map((stat) => (
          <View key={stat.name} style={styles.statRow}>
            <Text style={styles.statLabel}>{formatStatLabel(stat.name)}</Text>
            <View style={styles.statBarTrack}>
              <View style={[styles.statBarFill, { width: `${(stat.baseStat / 255) * 100}%` }]} />
            </View>
            <Text style={styles.statValue}>{stat.baseStat}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sections: {
    width: "100%",
    gap: 20,
  },

  section: {
    gap: 8,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },

  bodyText: {
    fontSize: 16,
    color: "#333333",
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  statLabel: {
    width: 36,
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
  },

  statBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ececec",
    overflow: "hidden",
  },

  statBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY,
  },

  statValue: {
    width: 32,
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    textAlign: "right",
  },
});
