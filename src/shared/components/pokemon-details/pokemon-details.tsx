import { capitalize } from "es-toolkit/string";
import { type ReactNode, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import type { PokemonDetail, PokemonTypeMatchup } from "@/data/pokemon-api";
import { Button } from "@/shared/components/button";
import { COLORS, RADIUS, SPACING, TYPE_SIZE } from "@/shared/styles/colors";

import {
  formatApiName,
  formatGenderRatio,
  formatGeneration,
  formatMultiplier,
  formatStatLabel,
} from "./pokemon-details.utils";

const STAT_MAX = 255;

type PokemonDetailsProps = {
  detail: PokemonDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function PokemonDetails({ detail, loading, error, onRetry }: PokemonDetailsProps) {
  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error !== null) {
    return (
      <View style={styles.errorBlock}>
        <Text style={styles.errorTitle}>Could not load details</Text>
        <Text style={styles.bodyText}>Check your connection and try again.</Text>
        {__DEV__ ? <Text style={styles.devDetail}>{error}</Text> : null}
        <Button label="Try again" onPress={onRetry} />
      </View>
    );
  }

  if (detail === null) {
    return null;
  }

  const { species, typeMatchups } = detail;
  const rarity = species?.isMythical ? "Mythical" : species?.isLegendary ? "Legendary" : null;

  return (
    <View style={styles.sections}>
      {species !== null && (species.genus !== null || species.flavorText !== null) ? (
        <Section index={0}>
          <View style={styles.aboutHeader}>
            {species.genus !== null ? <Text style={styles.genus}>{species.genus}</Text> : null}
            {rarity !== null ? (
              <View style={styles.rarityBadge}>
                <Text style={styles.rarityLabel}>{rarity}</Text>
              </View>
            ) : null}
          </View>
          {species.flavorText !== null ? (
            <Text style={styles.flavorText}>{species.flavorText}</Text>
          ) : null}
        </Section>
      ) : null}

      <Section index={1}>
        <Text style={styles.sectionTitle}>Types</Text>
        <View style={styles.typeRow}>
          {detail.types.map((type) => (
            <View key={`${type.slot}-${type.name}`} style={styles.typeBadge}>
              <Text style={styles.typeLabel}>{capitalize(type.name)}</Text>
            </View>
          ))}
        </View>
      </Section>

      {typeMatchups !== null ? (
        <Section index={2}>
          <Text style={styles.sectionTitle}>Defenses</Text>
          <MatchupGroup label="Weak to" matchups={typeMatchups.weakTo} />
          <MatchupGroup label="Resists" matchups={typeMatchups.resists} />
          <MatchupGroup
            label="Immune to"
            matchups={typeMatchups.immuneTo.map((type) => ({ type, multiplier: 0 }))}
          />
        </Section>
      ) : null}

      <Section index={3}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.tileGrid}>
          <InfoTile label="Height" value={`${detail.heightM.toFixed(1)} m`} />
          <InfoTile label="Weight" value={`${detail.weightKg.toFixed(1)} kg`} />
          {species !== null ? (
            <>
              <InfoTile label="Generation" value={formatGeneration(species.generation)} />
              <InfoTile
                label="Habitat"
                value={species.habitat !== null ? formatApiName(species.habitat) : "Unknown"}
              />
              <InfoTile label="Capture rate" value={`${species.captureRate} / 255`} />
              <InfoTile label="Gender" value={formatGenderRatio(species.genderRate)} />
              <InfoTile
                label="Egg groups"
                value={species.eggGroups.map(formatApiName).join(", ") || "None"}
              />
            </>
          ) : null}
        </View>
      </Section>

      <Section index={4}>
        <Text style={styles.sectionTitle}>Abilities</Text>
        {detail.abilities.map((ability) => (
          <Text key={ability.name} style={styles.bodyText}>
            {formatApiName(ability.name)}
            {ability.isHidden ? " (hidden)" : ""}
          </Text>
        ))}
      </Section>

      <Section index={5}>
        <Text style={styles.sectionTitle}>Base stats</Text>
        {detail.stats.map((stat, index) => (
          <StatBar
            key={stat.name}
            label={formatStatLabel(stat.name)}
            value={stat.baseStat}
            index={index}
          />
        ))}
      </Section>
    </View>
  );
}

function Section({ index, children }: { index: number; children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.delay(index * 50).duration(320)}
      style={styles.section}
    >
      {children}
    </Animated.View>
  );
}

function MatchupGroup({ label, matchups }: { label: string; matchups: PokemonTypeMatchup[] }) {
  if (matchups.length === 0) {
    return null;
  }

  return (
    <View style={styles.matchupGroup}>
      <Text style={styles.tileLabel}>{label}</Text>
      <View style={styles.typeRow}>
        {matchups.map((matchup) => {
          const isQuadWeak = matchup.multiplier >= 4;

          return (
            <View
              key={matchup.type}
              style={[styles.typeBadge, isQuadWeak ? styles.typeBadgeStrong : null]}
            >
              <Text style={[styles.typeLabel, isQuadWeak ? styles.typeLabelStrong : null]}>
                {capitalize(matchup.type)}{" "}
                <Text style={styles.multiplier}>{formatMultiplier(matchup.multiplier)}</Text>
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

function StatBar({ label, value, index }: { label: string; value: number; index: number }) {
  const reducedMotion = useReducedMotion();
  const ratio = Math.min(value / STAT_MAX, 1);
  const fill = useSharedValue(reducedMotion ? ratio : 0);

  useEffect(() => {
    if (reducedMotion) {
      fill.set(ratio);
      return;
    }

    fill.set(
      withDelay(index * 60, withTiming(ratio, { duration: 450, easing: Easing.out(Easing.cubic) })),
    );
  }, [fill, index, ratio, reducedMotion]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.get() * 100}%`,
  }));

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarTrack}>
        <Animated.View style={[styles.statBarFill, fillStyle]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function DetailsSkeleton() {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 1 : 0.45);

  useEffect(() => {
    if (reducedMotion) {
      opacity.set(1);
      return;
    }

    opacity.set(withRepeat(withTiming(1, { duration: 700 }), -1, true));
  }, [opacity, reducedMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  return (
    <Animated.View style={[styles.sections, pulseStyle]}>
      <View style={styles.skeletonLineWide} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineWide} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sections: {
    width: "100%",
    gap: 20,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    color: COLORS.TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.SURFACE,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT,
  },
  typeBadgeStrong: {
    backgroundColor: COLORS.PRIMARY_TINT,
  },
  typeLabelStrong: {
    color: COLORS.PRIMARY,
  },
  multiplier: {
    fontWeight: "700",
  },
  matchupGroup: {
    gap: SPACING.xs,
  },
  aboutHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: SPACING.sm,
  },
  genus: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    color: COLORS.TEXT,
  },
  rarityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.PRIMARY_TINT,
  },
  rarityLabel: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    color: COLORS.PRIMARY,
  },
  flavorText: {
    fontSize: TYPE_SIZE.body,
    lineHeight: 22,
    color: COLORS.TEXT_MUTED,
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  infoTile: {
    flexGrow: 1,
    flexBasis: "40%",
    gap: SPACING.xs,
    padding: SPACING.md,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.SURFACE,
  },
  tileLabel: {
    fontSize: TYPE_SIZE.caption,
    color: COLORS.TEXT_MUTED,
  },
  tileValue: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    color: COLORS.TEXT,
  },
  bodyText: {
    fontSize: TYPE_SIZE.body,
    color: COLORS.TEXT,
  },
  errorBlock: {
    alignSelf: "stretch",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT,
    textAlign: "center",
  },
  devDetail: {
    fontSize: TYPE_SIZE.caption,
    color: COLORS.TEXT_MUTED,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statLabel: {
    width: 36,
    fontSize: TYPE_SIZE.caption,
    fontWeight: "600",
    color: COLORS.TEXT_MUTED,
  },
  statBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.BORDER,
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
    color: COLORS.TEXT,
    textAlign: "right",
  },
  skeletonLine: {
    height: 16,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.BORDER,
  },
  skeletonLineWide: {
    height: 28,
    width: "70%",
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.BORDER,
  },
});
