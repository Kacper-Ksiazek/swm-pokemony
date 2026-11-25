import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Stack, useLocalSearchParams } from "expo-router";

import { PrimaryButton } from "../../components/primary-button";
import { useGameStore } from "../../store/game-store";
import { GAME_COLORS } from "../../theme";
import { VEHICLES } from "../../vehicles";

const NAME_MAX_LENGTH = 16;

/** Second setup step, once per player: name and vehicle. The route param is 1-based. */
export function SetupPlayerScreen() {
  const insets = useSafeAreaInsets();
  const { player } = useLocalSearchParams<{ player: string }>();
  const index = Math.max(0, Number(player) - 1);
  const players = useGameStore((state) => state.players);
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const startGame = useGameStore((state) => state.startGame);
  const current = players[index];
  const isLast = index >= players.length - 1;

  if (!current) {
    return null;
  }

  const goNext = () => {
    if (!isLast) {
      router.push({ pathname: "/setup/[player]", params: { player: String(index + 2) } });

      return;
    }

    startGame();
    router.dismissAll();
    router.replace("/game");
  };

  return (
    <>
      <Stack.Screen options={{ title: `Gracz ${index + 1} z ${players.length}` }} />
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.label}>Imię</Text>
          <View style={styles.nameRow}>
            <View style={[styles.colorDot, { backgroundColor: current.color }]} />
            <TextInput
              value={current.name}
              onChangeText={(name) => updatePlayer(index, { name })}
              placeholder={`Gracz ${index + 1}`}
              maxLength={NAME_MAX_LENGTH}
              autoCorrect={false}
              returnKeyType="done"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Pojazd</Text>
          <View style={styles.vehicles}>
            {VEHICLES.map((vehicle) => {
              const selected = vehicle.id === current.vehicleId;

              return (
                <Pressable
                  key={vehicle.id}
                  accessibilityRole="button"
                  accessibilityLabel={vehicle.name}
                  accessibilityState={{ selected }}
                  onPress={() => updatePlayer(index, { vehicleId: vehicle.id })}
                  style={[
                    styles.vehicle,
                    selected && {
                      borderColor: current.color,
                      backgroundColor: `${current.color}1A`,
                    },
                  ]}
                >
                  <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <PrimaryButton label={isLast ? "Zaczynamy!" : "Następny gracz"} onPress={goNext} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
  content: {
    gap: 28,
    padding: 24,
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: GAME_COLORS.textSecondary,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GAME_COLORS.surfaceBorder,
    backgroundColor: GAME_COLORS.surface,
    fontSize: 18,
    color: GAME_COLORS.textPrimary,
  },
  vehicles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  vehicle: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "47%",
    paddingVertical: 20,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: GAME_COLORS.surfaceBorder,
    backgroundColor: GAME_COLORS.surface,
  },
  vehicleEmoji: {
    fontSize: 40,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "700",
    color: GAME_COLORS.textPrimary,
  },
});
