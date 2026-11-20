import { useEffect } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/icon-symbol";

import { CHESS_PIECE_IMAGES } from "../../../assets/chess-assets";
import { VICE_CHESS_COLORS } from "../constants/vice-chess.constants";
import type { GameOutcome } from "../utils/chess-engine";

/** How long the game view takes to fade out before this screen starts fading in. */
export const RESULT_GAME_FADE_OUT_MS = 450;

const FADE_IN_MS = 500;
/** Children start after the screen itself has faded in a little. */
const BASE_DELAY_MS = RESULT_GAME_FADE_OUT_MS + 150;

type GameResultScreenProps = {
  outcome: GameOutcome;
  elapsedSeconds: number;
  onBack: () => void;
  onNewGame: () => void;
};

const COPY = {
  white: { eyebrow: "CHECKMATE", headline: "CYAN WINS", color: VICE_CHESS_COLORS.cyan },
  black: { eyebrow: "CHECKMATE", headline: "VICE WINS", color: VICE_CHESS_COLORS.pink },
  draw: { eyebrow: "STALEMATE", headline: "DRAW", color: VICE_CHESS_COLORS.gold },
} as const;

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function GameResultScreen({
  outcome,
  elapsedSeconds,
  onBack,
  onNewGame,
}: GameResultScreenProps) {
  const insets = useSafeAreaInsets();
  const { eyebrow, headline, color } = COPY[outcome];

  return (
    <Animated.View
      entering={FadeIn.delay(RESULT_GAME_FADE_OUT_MS).duration(FADE_IN_MS)}
      style={[
        styles.root,
        { paddingTop: Math.max(insets.top, 14) + 24, paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.delay(BASE_DELAY_MS).springify().damping(13)}>
          <Winner outcome={outcome} color={color} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(BASE_DELAY_MS + 250).duration(450)}
          style={styles.titleBlock}
        >
          <Text style={[styles.eyebrow, { color }]}>{eyebrow}</Text>
          <Text style={styles.headline}>{headline}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(BASE_DELAY_MS + 420).duration(450)}
          style={[styles.timeCard, { borderColor: color }]}
        >
          <Text style={styles.timeLabel}>GAME TIME</Text>
          <Text style={styles.timeValue}>{formatDuration(elapsedSeconds)}</Text>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(BASE_DELAY_MS + 600).duration(450)}
        style={styles.buttonRow}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={({ pressed }) => [styles.button, styles.buttonBack, pressed && styles.pressed]}
        >
          <IconSymbol name="chevron.left" size={18} color={VICE_CHESS_COLORS.textPrimary} />
          <Text style={styles.buttonLabel}>Back</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New game"
          onPress={onNewGame}
          style={({ pressed }) => [
            styles.button,
            styles.buttonNew,
            { backgroundColor: color },
            pressed && styles.pressed,
          ]}
        >
          <IconSymbol name="arrow.counterclockwise" size={18} color={VICE_CHESS_COLORS.bgDeep} />
          <Text style={[styles.buttonLabel, styles.buttonLabelOnColor]}>New game</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

/** The winning king in a breathing neon ring; a draw shows both kings. */
function Winner({ outcome, color }: { outcome: GameOutcome; color: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.set(
      withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.45 + 0.5 * pulse.get(),
    shadowRadius: 18 + 26 * pulse.get(),
    transform: [{ scale: 1 + 0.035 * pulse.get() }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        { borderColor: color, shadowColor: color, backgroundColor: "rgba(255, 255, 255, 0.04)" },
        glowStyle,
      ]}
    >
      {outcome === "draw" ? (
        <View style={styles.drawKings}>
          <Image
            source={CHESS_PIECE_IMAGES.white.king}
            style={styles.drawKing}
            contentFit="contain"
          />
          <Image
            source={CHESS_PIECE_IMAGES.black.king}
            style={styles.drawKing}
            contentFit="contain"
          />
        </View>
      ) : (
        <Image source={CHESS_PIECE_IMAGES[outcome].king} style={styles.king} contentFit="contain" />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: VICE_CHESS_COLORS.bgDeep,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  center: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  ring: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
  },
  king: {
    width: 170,
    height: 170,
  },
  drawKings: {
    flexDirection: "row",
    alignItems: "center",
  },
  drawKing: {
    width: 96,
    height: 96,
  },
  titleBlock: {
    alignItems: "center",
    gap: 6,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 4,
  },
  headline: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 2,
  },
  timeCard: {
    minWidth: 200,
    alignItems: "center",
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: VICE_CHESS_COLORS.cardBg,
  },
  timeLabel: {
    color: VICE_CHESS_COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  timeValue: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 48,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  buttonRow: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  buttonBack: {
    flex: 1,
    borderColor: "rgba(196, 181, 253, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  buttonNew: {
    flex: 1.5,
    borderColor: "transparent",
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: VICE_CHESS_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  buttonLabelOnColor: {
    color: VICE_CHESS_COLORS.bgDeep,
  },
});
