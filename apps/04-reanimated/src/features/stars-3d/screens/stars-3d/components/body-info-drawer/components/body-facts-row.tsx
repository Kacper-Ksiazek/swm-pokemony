import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/components/theme";

import type { BodyFactsRowProps } from "../body-info-drawer.types";

export function BodyFactsRow({ facts }: BodyFactsRowProps) {
  return (
    <View style={styles.factsRow}>
      {facts.map((fact) => (
        <View key={fact.label} style={styles.factCard}>
          <Text style={styles.factLabel}>{fact.label}</Text>
          <Text style={styles.factValue}>{fact.value}</Text>
          {fact.earthRef ? <Text style={styles.factRef}>{fact.earthRef}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  factsRow: {
    flexDirection: "row",
    gap: 8,
  },
  factCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  factLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  factValue: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  factRef: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.code,
  },
});
