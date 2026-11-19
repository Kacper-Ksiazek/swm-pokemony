import { Pressable, StyleSheet, Text, View } from "react-native";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import type { GamePhase, RaceStats } from "../sensors.types";

type GameOverlayProps = {
  phase: GamePhase;
  stats: RaceStats;
  onStart: () => void;
  onResume: () => void;
};

export function GameOverlay({ phase, stats, onStart, onResume }: GameOverlayProps) {
  if (phase === "playing") {
    return null;
  }

  return (
    <View style={styles.backdrop}>
      <View style={styles.modal}>
        {phase === "ready" && (
          <>
            <Text style={styles.badge}>BLUEPRINT · SENSORS</Text>
            <Text style={styles.title}>Sensor Racer</Text>
            <Text style={styles.description}>
              Trzymaj telefon poziomo jak kierownicę. Przechylaj w lewo lub w prawo (intensywność
              1–3), aby wyprzedzać jadące auta.
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.primaryButton} onPress={onStart}>
                <Text style={styles.primaryButtonText}>Start wyścigu</Text>
              </Pressable>
            </View>
          </>
        )}

        {phase === "paused" && (
          <>
            <Text style={styles.badge}>PAUZA</Text>
            <Text style={styles.title}>Wyścig wstrzymany</Text>
            <Text style={styles.description}>
              Wyprzedzone auta: {stats.overtaken} · Wynik: {stats.score}
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.primaryButton} onPress={onResume}>
                <Text style={styles.primaryButtonText}>Wznów</Text>
              </Pressable>
            </View>
          </>
        )}

        {phase === "gameover" && (
          <>
            <Text style={styles.badge}>KONIEC WYŚCIGU</Text>
            <Text style={styles.title}>Wynik: {stats.score}</Text>
            <Text style={styles.description}>
              Wyprzedzone auta: {stats.overtaken} · Rekord: {stats.bestScore}
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.primaryButton} onPress={onStart}>
                <Text style={styles.primaryButtonText}>Zagraj ponownie</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(17, 17, 20, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: theme.radius.lg,
  },
  modal: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  badge: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: theme.colors.accent,
    fontFamily: monoFont,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.sm,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
