import { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { DemoCard } from "@/components/demo-card";
import { DemoScreen, monoFont } from "@/components/demo-screen";
import { PrimaryButton } from "@/components/primary-button";
import { ResultBox } from "@/components/result-box";
import { theme } from "@/components/theme";

/** #9 sumMeThisObject: accepts { firstNum, lastNum } and returns { result }. */
export function SumObjectScreen() {
  const [firstInput, setFirstInput] = useState("4");
  const [lastInput, setLastInput] = useState("5");
  const [output, setOutput] = useState<{ result: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompute = useCallback(() => {
    const firstNum = Number(firstInput.trim().replace(",", "."));
    const lastNum = Number(lastInput.trim().replace(",", "."));

    if (
      !firstInput.trim() ||
      !lastInput.trim() ||
      Number.isNaN(firstNum) ||
      Number.isNaN(lastNum)
    ) {
      setError("Both firstNum and lastNum must be valid numbers.");
      return;
    }

    try {
      const next = globalThis.sumMeThisObject({ firstNum, lastNum });
      setOutput(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "sumMeThisObject failed.");
    }
  }, [firstInput, lastInput]);

  return (
    <DemoScreen badge="C++ ↔ JS Object" title="Sum Object">
      <DemoCard eyebrow="HOST FUNCTION" title="sumMeThisObject({ firstNum, lastNum })">
        <View style={styles.inputsRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>firstNum</Text>
            <TextInput
              style={styles.input}
              value={firstInput}
              onChangeText={setFirstInput}
              keyboardType="numbers-and-punctuation"
              placeholder="4"
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="done"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>lastNum</Text>
            <TextInput
              style={styles.input}
              value={lastInput}
              onChangeText={setLastInput}
              keyboardType="numbers-and-punctuation"
              placeholder="5"
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={handleCompute}
            />
          </View>
        </View>

        <PrimaryButton label="Compute in C++" onPress={handleCompute} />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {output !== null ? (
          <View style={styles.resultWrap}>
            <ResultBox label="Returned .result" value={output.result} />
            <Text style={styles.jsonText}>{JSON.stringify(output)}</Text>
          </View>
        ) : null}
      </DemoCard>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  inputsRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  errorBox: {
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    borderRadius: theme.radius.md,
    padding: 12,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  resultWrap: {
    gap: 8,
  },
  jsonText: {
    fontFamily: monoFont,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
