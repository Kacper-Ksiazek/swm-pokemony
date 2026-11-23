import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { BOARD, type TileId } from "../../../../blueprint";
import { PrimaryButton } from "../../../../components/primary-button";
import { useGameStore } from "../../../../store/game-store";
import { GAME_COLORS } from "../../../../theme";
import { polishPlural } from "../../../../utils/polish-plural";
import { SPIN_DURATION_MS, SpinWheel } from "./spin-wheel";
import { scorePlayer } from "../../../../engine/scoring";
import { formatMoney } from "../../../../utils/format-money";
import { PromptContent } from "./prompt-content";

/** Spin step: the wheel animates, then "Ruszaj" starts the move. */
function SpinContent() {
  const spin = useGameStore((state) => state.spin);
  const startMoving = useGameStore((state) => state.startMoving);
  const [spinDone, setSpinDone] = useState(false);

  useEffect(() => {
    setSpinDone(false);

    const timeout = setTimeout(() => setSpinDone(true), SPIN_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [spin]);

  return (
    <>
      <Text style={styles.title}>Kręcimy kołem!</Text>
      <SpinWheel result={spin ?? 1} />
      <Text style={styles.result}>{spinDone ? `Wylosowano: ${spin}` : " "}</Text>
      <PrimaryButton label="Ruszaj" onPress={startMoving} disabled={!spinDone} />
    </>
  );
}

/** Fork step: one button per branch, named after the route it leads to. */
function BranchContent() {
  const options = useGameStore((state) => state.branchOptions);
  const chooseBranch = useGameStore((state) => state.chooseBranch);

  return (
    <>
      <Text style={styles.title}>Rozwidlenie drogi</Text>
      <Text style={styles.body}>Którą drogą jedziesz dalej?</Text>
      <View style={styles.options}>
        {options.map((tileId: TileId) => {
          const route = BOARD.routes[BOARD.tilesById[tileId].routeId];

          return (
            <Pressable
              key={tileId}
              accessibilityRole="button"
              onPress={() => chooseBranch(tileId)}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            >
              <Text style={styles.optionTitle}>{route.title}</Text>
              <Text style={styles.optionMeta}>
                {`${route.tileIds.length} ${polishPlural(route.tileIds.length, "pole", "pola", "pól")}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

/** Game over: final score breakdown, best first, and a way back to setup. */
function FinishedContent() {
  const players = useGameStore((state) => state.players);
  const resetGame = useGameStore((state) => state.resetGame);
  const ranking = players
    .map((player) => ({ player, score: scorePlayer(player) }))
    .sort((a, b) => b.score.total - a.score.total);

  return (
    <>
      <Text style={styles.title}>Koniec gry</Text>
      <ScrollView style={styles.rankingScroll} contentContainerStyle={styles.ranking}>
        {ranking.map(({ player, score }, index) => (
          <View key={player.id} style={styles.rankingRow}>
            <View style={styles.rankingHeader}>
              <Text style={styles.rankingPlace}>{index === 0 ? "🏆" : `${index + 1}.`}</Text>
              <View style={[styles.dot, { backgroundColor: player.color }]} />
              <Text style={styles.rankingName}>{player.name}</Text>
              <Text style={styles.rankingTotal}>{formatMoney(score.total)}</Text>
            </View>
            <Text style={styles.rankingDetails}>
              {[
                `Konto ${formatMoney(score.money)}`,
                score.house > 0 && `Dom ${formatMoney(score.house)}`,
                score.children > 0 && `Dzieci ${formatMoney(score.children)}`,
                score.pets > 0 && `Zwierzaki ${formatMoney(score.pets)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        ))}
      </ScrollView>
      <PrimaryButton
        label="Nowa gra"
        onPress={() => {
          resetGame();
          router.replace("/");
        }}
      />
    </>
  );
}

/**
 * The one modal for everything that interrupts the board: spinning, picking a branch, landing on
 * a tile, and the end of the game. It is hidden while a pawn is driving, so the camera can follow.
 */
export function TurnModal() {
  const status = useGameStore((state) => state.status);
  const phase = useGameStore((state) => state.phase);
  const prompt = useGameStore((state) => state.prompts[0]);
  const visible =
    phase === "finished" ||
    status === "spinning" ||
    status === "choosing-branch" ||
    (status === "landed" && prompt !== undefined);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      // Must match the app orientations in app.json, or iOS refuses to present the modal.
      supportedOrientations={["portrait"]}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {phase === "finished" ? (
            <FinishedContent />
          ) : status === "spinning" ? (
            <SpinContent />
          ) : status === "choosing-branch" ? (
            <BranchContent />
          ) : status === "landed" && prompt ? (
            <PromptContent prompt={prompt} />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
  },
  card: {
    alignItems: "stretch",
    gap: 16,
    width: "100%",
    maxWidth: 380,
    padding: 24,
    borderRadius: 26,
    backgroundColor: GAME_COLORS.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    color: GAME_COLORS.textPrimary,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    color: GAME_COLORS.textSecondary,
  },
  result: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: GAME_COLORS.accent,
  },
  options: {
    gap: 12,
  },
  option: {
    gap: 4,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: GAME_COLORS.surfaceBorder,
  },
  optionPressed: {
    borderColor: GAME_COLORS.accent,
    backgroundColor: "#FDECEE",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: GAME_COLORS.textPrimary,
  },
  optionMeta: {
    fontSize: 14,
    color: GAME_COLORS.textMuted,
  },
  ranking: {
    gap: 10,
  },
  rankingScroll: {
    maxHeight: 320,
  },
  rankingRow: {
    gap: 4,
  },
  rankingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankingTotal: {
    marginLeft: "auto",
    fontSize: 16,
    fontWeight: "900",
    color: GAME_COLORS.textPrimary,
  },
  rankingDetails: {
    marginLeft: 38,
    fontSize: 13,
    color: GAME_COLORS.textMuted,
  },
  rankingPlace: {
    width: 28,
    fontSize: 18,
    fontWeight: "900",
    color: GAME_COLORS.textPrimary,
  },
  rankingName: {
    fontSize: 18,
    fontWeight: "700",
    color: GAME_COLORS.textPrimary,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
