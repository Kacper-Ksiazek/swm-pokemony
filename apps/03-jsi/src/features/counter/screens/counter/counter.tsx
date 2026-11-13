import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type Operation = "add" | "subtract" | "multiply";

const OPERATIONS: { value: Operation; label: string; symbol: string }[] = [
  { value: "add", label: "Add", symbol: "+" },
  { value: "subtract", label: "Subtract", symbol: "−" },
  { value: "multiply", label: "Multiply", symbol: "×" },
];

export function CounterScreen() {
  const [counter, setCounter] = useState(() => globalThis.counter);
  const [numberInput, setNumberInput] = useState("");
  const [numbers, setNumbers] = useState<number[]>([10, 5, 2]);
  const [operation, setOperation] = useState<Operation>("add");
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const handleRefresh = useCallback(() => {
    setCounter(globalThis.counter);
  }, []);

  const handleIncrement = useCallback(() => {
    globalThis.increment();
    setCounter(globalThis.counter);
  }, []);

  const handleDecrement = useCallback(() => {
    globalThis.decrement();
    setCounter(globalThis.counter);
  }, []);

  const handleAddNumber = useCallback(() => {
    const parsed = Number(numberInput.trim().replace(",", "."));
    if (!numberInput.trim() || Number.isNaN(parsed)) {
      setCalcError("Enter a valid number.");
      return;
    }

    setNumbers((prev) => [...prev, parsed]);
    setNumberInput("");
    setCalcError(null);
  }, [numberInput]);

  const handleRemoveNumber = useCallback((indexToRemove: number) => {
    setNumbers((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }, []);

  const handleClearNumbers = useCallback(() => {
    setNumbers([]);
    setCalcResult(null);
    setCalcError(null);
  }, []);

  const handleCalculate = useCallback(() => {
    try {
      const result = globalThis.calculate(numbers, operation);
      setCalcResult(result);
      setCalcError(null);
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : "Calculation failed.");
    }
  }, [numbers, operation]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>C++ ↔ JS Bridge</Text>
            </View>
            <Text style={styles.title}>JSI Counter</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.refreshButton, pressed && styles.buttonPressed]}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonLabel}>Sync</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEyebrow}>NATIVE STATE</Text>
            <Text style={styles.cardTitle}>Kacper counter (C++)</Text>
          </View>

          <View style={styles.counterDisplay}>
            <Text style={styles.counterValue}>{counter}</Text>
          </View>

          <View style={styles.counterActions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.decrementButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleDecrement}
            >
              <Text style={styles.decrementButtonLabel}>− Decrement</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.incrementButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleIncrement}
            >
              <Text style={styles.incrementButtonLabel}>+ Increment</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEyebrow}>HOST FUNCTION</Text>
              <Text style={styles.cardTitle}>JSI Calculator</Text>
            </View>
            {numbers.length > 0 ? (
              <Pressable
                style={({ pressed }) => [styles.clearButton, pressed && styles.buttonPressed]}
                onPress={handleClearNumbers}
              >
                <Text style={styles.clearButtonLabel}>Clear</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={numberInput}
              onChangeText={setNumberInput}
              placeholder="Add number (e.g. 42)"
              placeholderTextColor="#64748B"
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              onSubmitEditing={handleAddNumber}
            />
            <Pressable
              style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
              onPress={handleAddNumber}
            >
              <Text style={styles.addButtonLabel}>+ Add</Text>
            </Pressable>
          </View>

          <View style={styles.chipsWrap}>
            {numbers.length === 0 ? (
              <Text style={styles.emptyText}>No numbers added yet (empty array returns 0)</Text>
            ) : (
              numbers.map((value, index) => (
                <Pressable
                  key={`${index}-${value}`}
                  style={({ pressed }) => [styles.numberChip, pressed && styles.buttonPressed]}
                  onPress={() => handleRemoveNumber(index)}
                >
                  <Text style={styles.numberChipText}>{value}</Text>
                  <Text style={styles.numberChipRemove}>×</Text>
                </Pressable>
              ))
            )}
          </View>

          <View style={styles.operationRow}>
            {OPERATIONS.map((item) => {
              const selected = item.value === operation;
              return (
                <Pressable
                  key={item.value}
                  style={({ pressed }) => [
                    styles.operationButton,
                    selected && styles.operationButtonSelected,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => setOperation(item.value)}
                >
                  <Text style={[styles.operationSymbol, selected && styles.operationTextSelected]}>
                    {item.symbol}
                  </Text>
                  <Text style={[styles.operationLabel, selected && styles.operationTextSelected]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={({ pressed }) => [styles.computeButton, pressed && styles.buttonPressed]}
            onPress={handleCalculate}
          >
            <Text style={styles.computeButtonLabel}>Compute in C++</Text>
          </Pressable>

          {calcError ? (
            <View style={styles.calcErrorBox}>
              <Text style={styles.calcErrorText}>{calcError}</Text>
            </View>
          ) : null}

          {calcResult !== null ? (
            <View style={styles.calcResultBox}>
              <Text style={styles.calcResultLabel}>Result</Text>
              <Text style={styles.calcResultValue}>{calcResult}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#141C33",
    borderWidth: 1,
    borderColor: "#253154",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#34D399",
  },
  badgeText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F8FAFC",
    letterSpacing: -0.5,
  },
  refreshButton: {
    backgroundColor: "#18223F",
    borderWidth: 1,
    borderColor: "#2E3E6B",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  refreshButtonLabel: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#12192E",
    borderWidth: 1,
    borderColor: "#222E50",
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  cardHeader: {
    gap: 4,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#64748B",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  counterDisplay: {
    backgroundColor: "#0A0F1E",
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 56,
    fontWeight: "700",
    color: "#38BDF8",
    fontVariant: ["tabular-nums"],
  },
  counterActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  decrementButton: {
    backgroundColor: "#1B233D",
    borderWidth: 1,
    borderColor: "#2E3B61",
  },
  decrementButtonLabel: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "600",
  },
  incrementButton: {
    backgroundColor: "#2563EB",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  incrementButtonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  clearButton: {
    backgroundColor: "#18223F",
    borderWidth: 1,
    borderColor: "#2E3E6B",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearButtonLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#0A0F1E",
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#F8FAFC",
    fontSize: 15,
  },
  addButton: {
    backgroundColor: "#18223F",
    borderWidth: 1,
    borderColor: "#2E3E6B",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonLabel: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "700",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
  },
  numberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#18223F",
    borderWidth: 1,
    borderColor: "#2E3E6B",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  numberChipText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  numberChipRemove: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "700",
  },
  operationRow: {
    flexDirection: "row",
    gap: 8,
  },
  operationButton: {
    flex: 1,
    backgroundColor: "#0A0F1E",
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 2,
  },
  operationButtonSelected: {
    backgroundColor: "#172554",
    borderColor: "#38BDF8",
  },
  operationSymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: "#94A3B8",
  },
  operationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },
  operationTextSelected: {
    color: "#38BDF8",
  },
  computeButton: {
    backgroundColor: "#2563EB",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  computeButtonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  calcErrorBox: {
    backgroundColor: "#2D121D",
    borderWidth: 1,
    borderColor: "#881337",
    borderRadius: 12,
    padding: 12,
  },
  calcErrorText: {
    color: "#FDA4AF",
    fontSize: 13,
    fontWeight: "600",
  },
  calcResultBox: {
    backgroundColor: "#0A0F1E",
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calcResultLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  calcResultValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#34D399",
    fontVariant: ["tabular-nums"],
  },
});
