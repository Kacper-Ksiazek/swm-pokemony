import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/icon-symbol";

import { VICE_CHESS_COLORS } from "../../../constants/vice-chess.constants";
import type { GameOutcome } from "../../../utils/chess-engine";

import { Winner } from "./components/winner";
import { BASE_DELAY_MS, FADE_IN_MS, RESULT_GAME_FADE_OUT_MS } from "./game-result-screen.constants";
import { GAME_RESULT_COPY } from "./game-result-screen.copy";
import { gameResultScreenStyles as styles } from "./game-result-screen.styles";
import { formatDuration } from "./utils/format-duration";

type GameResultScreenProps = {
  outcome: GameOutcome;
  elapsedSeconds: number;
  onBack: () => void;
  onNewGame: () => void;
};

export function GameResultScreen({
  outcome,
  elapsedSeconds,
  onBack,
  onNewGame,
}: GameResultScreenProps) {
  const insets = useSafeAreaInsets();
  const { eyebrow, headline, color } = GAME_RESULT_COPY[outcome];

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
