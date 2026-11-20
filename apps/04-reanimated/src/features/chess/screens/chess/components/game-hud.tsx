import { useEffect } from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { CHESS_PIECE_IMAGES, type PieceColor } from "../../../assets/chess-assets";
import { VICE_CHESS_COLORS } from "../constants/vice-chess.constants";

type GameHudProps = {
  turn: PieceColor;
  isGameOver: boolean;
  elapsedSeconds: number;
};

type Team = {
  color: string;
  tint: string;
  king: (typeof CHESS_PIECE_IMAGES)["white"]["king"];
};

const TEAMS: Record<PieceColor, Team> = {
  white: {
    color: VICE_CHESS_COLORS.cyan,
    tint: "rgba(0, 240, 255, 0.12)",
    king: CHESS_PIECE_IMAGES.white.king,
  },
  black: {
    color: VICE_CHESS_COLORS.pink,
    tint: "rgba(255, 46, 147, 0.12)",
    king: CHESS_PIECE_IMAGES.black.king,
  },
};

const IDLE_BORDER = "rgba(196, 181, 253, 0.16)";

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function GameHud({ turn, isGameOver, elapsedSeconds }: GameHudProps) {
  return (
    <View style={styles.row}>
      <PlayerBadge team={TEAMS.white} active={turn === "white" && !isGameOver} />

      <View style={styles.timer}>
        <Text style={styles.timerValue} adjustsFontSizeToFit numberOfLines={1}>
          {formatDuration(elapsedSeconds)}
        </Text>
      </View>

      <PlayerBadge team={TEAMS.black} active={turn === "black" && !isGameOver} />
    </View>
  );
}

function PlayerBadge({ team, active }: { team: Team; active: boolean }) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(active ? 1 : 0, { duration: 260, easing: Easing.out(Easing.quad) }));
  }, [active, progress]);

  const badgeStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.get(), [0, 1], [IDLE_BORDER, team.color]),
    opacity: 0.5 + 0.5 * progress.get(),
    shadowOpacity: 0.8 * progress.get(),
    transform: [{ scale: 0.94 + 0.06 * progress.get() }],
  }));

  return (
    <Animated.View
      style={[styles.badge, { shadowColor: team.color, backgroundColor: team.tint }, badgeStyle]}
    >
      <Image source={team.king} style={styles.king} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
  },
  king: {
    width: 40,
    height: 40,
  },
  timer: {
    flex: 1,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(157, 78, 221, 0.55)",
    backgroundColor: "rgba(157, 78, 221, 0.1)",
  },
  timerValue: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
