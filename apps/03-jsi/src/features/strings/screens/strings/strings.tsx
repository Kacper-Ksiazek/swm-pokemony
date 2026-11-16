import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { DemoCard } from "@/components/demo-card";
import { DemoScreen } from "@/components/demo-screen";
import { ErrorBox, ResultBox } from "@/components/result-box";
import { PrimaryButton } from "@/components/primary-button";
import { theme } from "@/components/theme";

type StringOperation = "uppercase" | "lowercase" | "reverse" | "capitalize" | "shuffle" | "blur";

const STRING_OPERATIONS: { value: StringOperation; label: string }[] = [
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "reverse", label: "Reverse" },
  { value: "capitalize", label: "Capitalize" },
  { value: "shuffle", label: "Shuffle" },
  { value: "blur", label: "Blur" },
];

const DEFAULT_INPUT = "JSI workshop";

/** #8 reverse (and other ops) through a C++ HostFunction. */
export function StringsScreen() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [operation, setOperation] = useState<StringOperation>("uppercase");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transform = useCallback(
    (nextOperation: StringOperation) => {
      try {
        setResult(globalThis.transformString(input, nextOperation));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "String transform failed.");
      }
    },
    [input],
  );

  const handleSelectOperation = useCallback(
    (nextOperation: StringOperation) => {
      setOperation(nextOperation);
      transform(nextOperation);
    },
    [transform],
  );

  const handleReset = useCallback(() => {
    setInput(DEFAULT_INPUT);
    setResult(null);
    setError(null);
  }, []);

  return (
    <DemoScreen
      badge="C++ ↔ JS Bridge"
      title="Strings"
      action={{ label: "Reset", onPress: handleReset }}
    >
      <DemoCard
        eyebrow="HOST FUNCTION"
        title="transformString(str, op)"
        headerRight={<Text style={styles.count}>{input.length}/100</Text>}
      >
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Enter 2–100 characters..."
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => transform(operation)}
        />

        <View style={styles.grid}>
          {STRING_OPERATIONS.map((item) => {
            const selected = item.value === operation;
            return (
              <Pressable
                key={item.value}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => handleSelectOperation(item.value)}
              >
                <Text style={[styles.chipLabel, selected && styles.selectedText]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton label="Transform in C++" onPress={() => transform(operation)} />

        {error ? <ErrorBox message={error} /> : null}
        {result !== null ? <ResultBox label={`Output (${operation})`} value={result} mono /> : null}
      </DemoCard>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  count: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipSelected: {
    backgroundColor: theme.colors.chipSelected,
    borderColor: theme.colors.accent,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  selectedText: {
    color: theme.colors.accent,
  },
});
