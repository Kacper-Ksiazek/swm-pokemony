import { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { DemoCard } from "@/components/demo-card";
import { DemoScreen, monoFont } from "@/components/demo-screen";
import { PrimaryButton, SecondaryButton } from "@/components/primary-button";
import { ResultBox } from "@/components/result-box";
import { theme } from "@/components/theme";

/** #7 divideMeThis: divides two numbers in C++ and throws a JS error on divide by zero. */
export function DivideScreen() {
  const [dividendInput, setDividendInput] = useState("10");
  const [divisorInput, setDivisorInput] = useState("5");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDivide = useCallback((aRaw: string, bRaw: string) => {
    const a = Number(aRaw.trim().replace(",", "."));
    const b = Number(bRaw.trim().replace(",", "."));

    if (!aRaw.trim() || !bRaw.trim() || Number.isNaN(a) || Number.isNaN(b)) {
      setResult(null);
      setError("Both arguments must be valid numbers.");
      return;
    }

    try {
      const quotient = globalThis.divideMeThis(a, b);
      setResult(quotient);
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Division failed.");
    }
  }, []);

  const handleDivide = useCallback(() => {
    runDivide(dividendInput, divisorInput);
  }, [dividendInput, divisorInput, runDivide]);

  const handleTestDivideByZero = useCallback(() => {
    setDivisorInput("0");
    runDivide(dividendInput, "0");
  }, [dividendInput, runDivide]);

  return (
    <DemoScreen badge="C++ ↔ JS Error" title="Divide">
      <DemoCard eyebrow="HOST FUNCTION" title="divideMeThis(a, b)">
        <View style={styles.inputsRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dividend (a)</Text>
            <TextInput
              style={styles.input}
              value={dividendInput}
              onChangeText={setDividendInput}
              keyboardType="numbers-and-punctuation"
              placeholder="10"
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="done"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Divisor (b)</Text>
            <TextInput
              style={styles.input}
              value={divisorInput}
              onChangeText={setDivisorInput}
              keyboardType="numbers-and-punctuation"
              placeholder="5"
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={handleDivide}
            />
          </View>
        </View>

        <View style={styles.actionsRow}>
          <SecondaryButton label="Divide by 0" onPress={handleTestDivideByZero} />
          <PrimaryButton label="Divide in C++" onPress={handleDivide} />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Caught JS Exception</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result !== null ? <ResultBox label="Quotient (a / b)" value={result} /> : null}
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
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  errorBox: {
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    borderRadius: theme.radius.md,
    padding: 12,
    gap: 4,
  },
  errorTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
});
