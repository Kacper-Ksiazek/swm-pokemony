import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { PrimaryButton } from "../../components/primary-button";
import { useGameStore } from "../../store/game-store";
import { GAME_COLORS } from "../../theme";
import { MAX_PLAYERS, MIN_PLAYERS } from "../../vehicles";

const COUNTS = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i);

/** First setup step: how many people play. */
export function SetupPlayersScreen() {
  const insets = useSafeAreaInsets();
  const playerCount = useGameStore((state) => state.players.length);
  const setPlayerCount = useGameStore((state) => state.setPlayerCount);

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Ścieżka życia</Text>
        <Text style={styles.subtitle}>Ilu graczy dziś gra?</Text>
      </View>

      <View style={styles.counts}>
        {COUNTS.map((count) => {
          const selected = count === playerCount;

          return (
            <Pressable
              key={count}
              accessibilityRole="button"
              accessibilityLabel={`${count} ${count === 1 ? "gracz" : "graczy"}`}
              accessibilityState={{ selected }}
              onPress={() => setPlayerCount(count)}
              style={[styles.countButton, selected && styles.countButtonSelected]}
            >
              <Text style={[styles.countLabel, selected && styles.countLabelSelected]}>
                {count}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        label="Dalej"
        onPress={() => router.push({ pathname: "/setup/[player]", params: { player: "1" } })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    backgroundColor: GAME_COLORS.background,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: GAME_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 18,
    color: GAME_COLORS.textSecondary,
  },
  counts: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  countButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 68,
    height: 68,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: GAME_COLORS.surfaceBorder,
    backgroundColor: GAME_COLORS.surface,
  },
  countButtonSelected: {
    borderColor: GAME_COLORS.accent,
    backgroundColor: "#FDECEE",
  },
  countLabel: {
    fontSize: 26,
    fontWeight: "800",
    color: GAME_COLORS.textSecondary,
  },
  countLabelSelected: {
    color: GAME_COLORS.accent,
  },
});
