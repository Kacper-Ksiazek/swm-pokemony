import { useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { DemoCard } from "@/components/demo-card";
import { DemoScreen, monoFont } from "@/components/demo-screen";
import { PrimaryButton } from "@/components/primary-button";
import { theme } from "@/components/theme";

type GlobalsSnapshot = {
  answer: number;
  isWednesday: boolean;
  workshopName: string;
  myAwesomeArray: [number, boolean, string];
};

function readGlobals(): GlobalsSnapshot {
  return {
    answer: globalThis.answerToTheUltimateQuestionOfLifeTheUniverseAndEverything,
    isWednesday: globalThis.isWednesday,
    workshopName: globalThis.workshopName,
    myAwesomeArray: globalThis.myAwesomeArray,
  };
}

export function GlobalsScreen() {
  const [snapshot, setSnapshot] = useState<GlobalsSnapshot>(readGlobals);

  const handleRefresh = useCallback(() => {
    setSnapshot(readGlobals());
  }, []);

  return (
    <DemoScreen badge="C++ ↔ JS Bridge" title="Globals">
      <DemoCard eyebrow="GLOBALTHIS SNAPSHOT">
        <Text style={styles.code}>{JSON.stringify(snapshot, null, 2)}</Text>
      </DemoCard>
      <PrimaryButton label="Refresh" onPress={handleRefresh} />
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  code: {
    fontFamily: monoFont,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.code,
  },
});
