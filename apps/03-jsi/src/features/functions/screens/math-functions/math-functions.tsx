import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { DemoCard } from "@/components/demo-card";
import { DemoScreen } from "@/components/demo-screen";
import { PrimaryButton } from "@/components/primary-button";
import { ErrorBox, ResultBox } from "@/components/result-box";
import { theme } from "@/components/theme";

type Operation = "add" | "subtract" | "multiply";

const OPERATIONS: { value: Operation; label: string; symbol: string }[] = [
  { value: "add", label: "Add", symbol: "+" },
  { value: "subtract", label: "Subtract", symbol: "−" },
  { value: "multiply", label: "Multiply", symbol: "×" },
];

/** #6 / #10 calculate(numbers, op): reduces a number array in C++. */
export function MathFunctionsScreen() {
  const [numberInput, setNumberInput] = useState("");
  const [numbers, setNumbers] = useState<number[]>([10, 5, 2]);
  const [operation, setOperation] = useState<Operation>("add");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddNumber = useCallback(() => {
    const parsed = Number(numberInput.trim().replace(",", "."));
    if (!numberInput.trim() || Number.isNaN(parsed)) {
      setError("Enter a valid number.");
      return;
    }
    setNumbers((prev) => [...prev, parsed]);
    setNumberInput("");
    setError(null);
  }, [numberInput]);

  const handleRemoveNumber = useCallback((indexToRemove: number) => {
    setNumbers((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }, []);

  const handleClear = useCallback(() => {
    setNumbers([]);
    setResult(null);
    setError(null);
  }, []);

  const handleCalculate = useCallback(() => {
    try {
      setResult(globalThis.calculate(numbers, operation));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed.");
    }
  }, [numbers, operation]);

  return (
    <DemoScreen badge="C++ ↔ JS Bridge" title="Math functions">
      <DemoCard
        eyebrow="HOST FUNCTION"
        title="calculate(numbers, op)"
        headerRight={
          numbers.length > 0 ? (
            <Pressable style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearLabel}>Clear</Text>
            </Pressable>
          ) : null
        }
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={numberInput}
            onChangeText={setNumberInput}
            placeholder="Add number (e.g. 42)"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            onSubmitEditing={handleAddNumber}
          />
          <Pressable style={styles.addButton} onPress={handleAddNumber}>
            <Text style={styles.addLabel}>+ Add</Text>
          </Pressable>
        </View>

        <View style={styles.chips}>
          {numbers.length === 0 ? (
            <Text style={styles.emptyText}>No numbers added yet (empty array returns 0)</Text>
          ) : (
            numbers.map((value, index) => (
              <Pressable
                key={`${index}-${value}`}
                style={styles.chip}
                onPress={() => handleRemoveNumber(index)}
              >
                <Text style={styles.chipText}>{value}</Text>
                <Text style={styles.chipRemove}>×</Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.row}>
          {OPERATIONS.map((item) => {
            const selected = item.value === operation;
            return (
              <Pressable
                key={item.value}
                style={[styles.opButton, selected && styles.opButtonSelected]}
                onPress={() => setOperation(item.value)}
              >
                <Text style={[styles.opSymbol, selected && styles.selectedText]}>
                  {item.symbol}
                </Text>
                <Text style={[styles.opLabel, selected && styles.selectedText]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton label="Compute in C++" onPress={handleCalculate} />

        {error ? <ErrorBox message={error} /> : null}
        {result !== null ? <ResultBox label="Result" value={result} /> : null}
      </DemoCard>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.chipBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.chipBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addLabel: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.chipBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: theme.colors.textHeading,
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  chipRemove: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  opButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    alignItems: "center",
    gap: 2,
  },
  opButtonSelected: {
    backgroundColor: theme.colors.chipSelected,
    borderColor: theme.colors.accent,
  },
  opSymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  opLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  selectedText: {
    color: theme.colors.accent,
  },
});
