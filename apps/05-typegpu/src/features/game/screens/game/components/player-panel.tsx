import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BOARD } from "../../../blueprint";
import { PrimaryButton } from "../../../components/primary-button";
import { stepsToFinish } from "../../../store/game-rules";
import { useGameStore, type TurnStatus } from "../../../store/game-store";
import { GAME_COLORS } from "../../../theme";
import { polishPlural } from "../../../utils/polish-plural";
import { VEHICLES_BY_ID } from "../../../vehicles";
import { CAREERS_BY_ID } from "../../../content/careers";
import { HOUSES_BY_ID } from "../../../content/houses";
import { formatMoney } from "../../../utils/format-money";
import { TILE_KIND_LABELS } from "../scene/tile-palette";

const STEPS_TO_FINISH = stepsToFinish(BOARD);

const STATUS_TEXT: Record<TurnStatus, string> = {
  idle: "Twoja kolej",
  spinning: "Koło się kręci…",
  moving: "W drodze…",
  "choosing-branch": "Wybierz drogę",
  landed: "Na polu",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/** Below the board: whose turn it is, where they stand, and the button that spins the wheel. */
export function PlayerPanel({ bottomInset }: { bottomInset: number }) {
  const players = useGameStore((state) => state.players);
  const currentIndex = useGameStore((state) => state.currentIndex);
  const status = useGameStore((state) => state.status);
  const spinWheel = useGameStore((state) => state.spinWheel);
  const player = players[currentIndex];
  const tile = BOARD.tilesById[player.tileId];
  const vehicle = VEHICLES_BY_ID[player.vehicleId];
  const remaining = STEPS_TO_FINISH[player.tileId] ?? 0;
  const banner = useGameStore((state) => state.banner);
  const career = player.careerId ? CAREERS_BY_ID[player.careerId] : null;
  const house = player.houseId ? HOUSES_BY_ID[player.houseId] : null;
  const assets = [
    `Trasa: ${BOARD.routes[tile.routeId].title}`,
    player.hasDegree && "🎓 Dyplom",
    house && `${house.emoji} ${house.name}`,
    player.children > 0 && `👶 ${player.children}`,
    player.pets > 0 && `🐾 ${player.pets}`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <View style={[styles.panel, { paddingBottom: bottomInset + 12 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.queue}
      >
        {players.map((candidate, index) => (
          <View
            key={candidate.id}
            style={[styles.chip, index === currentIndex && { borderColor: candidate.color }]}
          >
            <View style={[styles.dot, { backgroundColor: candidate.color }]} />
            <Text style={styles.chipText}>
              {candidate.finished ? `${candidate.name} ✓` : candidate.name}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.header}>
        <Text style={styles.vehicle}>{vehicle.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={[styles.status, { color: player.color }]}>{STATUS_TEXT[status]}</Text>
        </View>
      </View>

      {banner && <Text style={styles.banner}>{banner}</Text>}

      <View style={styles.stats}>
        <Stat label="Konto" value={formatMoney(player.money)} />
        <Stat
          label="Zawód"
          value={career ? `${career.name} · ${formatMoney(player.salary)}` : "Bez pracy"}
        />
        <Stat label="Pole" value={tile.label ?? TILE_KIND_LABELS[tile.kind]} />
        <Stat
          label="Ostatni rzut"
          value={
            status === "spinning" ? "…" : player.lastSpin === null ? "—" : String(player.lastSpin)
          }
        />
        <Stat
          label="Do mety"
          value={`${remaining} ${polishPlural(remaining, "pole", "pola", "pól")}`}
        />
      </View>

      <Text style={styles.assets}>{assets}</Text>

      <PrimaryButton
        label={status === "moving" ? "W drodze…" : "Zakręć kołem"}
        onPress={spinWheel}
        disabled={status !== "idle" || player.finished}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 14,
    paddingTop: 14,
    paddingHorizontal: 16,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: GAME_COLORS.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  queue: {
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: GAME_COLORS.surfaceBorder,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: GAME_COLORS.textPrimary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vehicle: {
    fontSize: 36,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: GAME_COLORS.textPrimary,
  },
  status: {
    fontSize: 14,
    fontWeight: "800",
  },
  banner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF4D6",
    fontSize: 14,
    fontWeight: "700",
    color: "#8A5A00",
  },
  assets: {
    fontSize: 13,
    fontWeight: "600",
    color: GAME_COLORS.textSecondary,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  stat: {
    width: "50%",
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: GAME_COLORS.textMuted,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: GAME_COLORS.textPrimary,
  },
});
