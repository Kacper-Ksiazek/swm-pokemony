import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReferenceNumericPanel } from "./reference";
import { SolutionNumericPanel } from "./solution";
import {
  clampThreeDigitValue,
  type NumericLabSource,
  NumericLabSourceTabs,
  randomNumericDelta,
} from "./shared";

export function Task2Screen() {
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<NumericLabSource>("reference");
  const [value, setValue] = useState(1);

  const addRandom = useCallback(() => {
    setValue((current) => clampThreeDigitValue(current + randomNumericDelta()));
  }, []);

  const subtractRandom = useCallback(() => {
    setValue((current) => clampThreeDigitValue(current - randomNumericDelta()));
  }, []);

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: insets.bottom },
      ]}
    >
      <NumericLabSourceTabs value={source} onChange={setSource} />

      <View style={styles.panelSlot}>
        {source === "reference" ? (
          <ReferenceNumericPanel value={value} onAdd={addRandom} onSubtract={subtractRandom} />
        ) : (
          <SolutionNumericPanel value={value} onAdd={addRandom} onSubtract={subtractRandom} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    gap: 16,
  },
  panelSlot: {
    flex: 1,
    minHeight: 0,
  },
});
