import { Text, View } from "react-native";

import { INITIAL_LIVES } from "../../constants";
import { AnimatedHeart } from "./components/animated-heart";
import { styles } from "./score-visualizer.styles";
import type { ScoreVisualizerProps } from "./score-visualizer.types";

/** HUD card: live score and animated life hearts. */
export function ScoreVisualizer({ stats }: ScoreVisualizerProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.scoreValue} numberOfLines={1} adjustsFontSizeToFit>
        {stats.score}
      </Text>

      <View style={styles.heartsRow}>
        {Array.from({ length: INITIAL_LIVES }).map((_, index) => (
          <AnimatedHeart key={`heart-${index}`} active={index < stats.lives} />
        ))}
      </View>
    </View>
  );
}
