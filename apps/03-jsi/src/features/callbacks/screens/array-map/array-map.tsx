import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { DemoCard } from "@/components/demo-card";
import { DemoScreen, monoFont } from "@/components/demo-screen";
import { ErrorBox, ResultBox } from "@/components/result-box";
import { PrimaryButton } from "@/components/primary-button";
import { theme } from "@/components/theme";

type MapperKey = "square" | "double" | "plusTen" | "negate";

const MAPPERS: { key: MapperKey; label: string; code: string; fn: (x: number) => number }[] = [
  { key: "square", label: "Square", code: "x => x * x", fn: (x) => x * x },
  { key: "double", label: "Double", code: "x => x * 2", fn: (x) => x * 2 },
  { key: "plusTen", label: "+ 10", code: "x => x + 10", fn: (x) => x + 10 },
  { key: "negate", label: "Negate", code: "x => -x", fn: (x) => -x },
];

const DEFAULT_NUMBERS = [1, 2, 3, 4, 5];

/** #11 nativeMap: C++ calls back into a JS function for each element. */
export function ArrayMapScreen() {
  const [numberInput, setNumberInput] = useState("");
  const [numbers, setNumbers] = useState<number[]>(DEFAULT_NUMBERS);
  const [selectedMapper, setSelectedMapper] = useState<MapperKey>("square");
  const [result, setResult] = useState<number[] | null>(null);
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

  const handleReset = useCallback(() => {
    setNumbers(DEFAULT_NUMBERS);
    setNumberInput("");
    setResult(null);
    setError(null);
  }, []);

  const runMap = useCallback(
    (mapperKey: MapperKey) => {
      const mapper = MAPPERS.find((item) => item.key === mapperKey) ?? MAPPERS[0];
      try {
        setResult(globalThis.nativeMap(numbers, mapper.fn));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "nativeMap failed.");
      }
    },
    [numbers],
  );

  const handleSelectMapper = useCallback(
    (mapperKey: MapperKey) => {
      setSelectedMapper(mapperKey);
      runMap(mapperKey);
    },
    [runMap],
  );

  return (
    <DemoScreen
      badge="C++ ↔ JS Callback"
      title="Array Map"
      action={{ label: "Reset", onPress: handleReset }}
    >
      <DemoCard
        eyebrow="HOST FUNCTION"
        title="nativeMap(array, fn)"
        headerRight={<Text style={styles.count}>{numbers.length} items</Text>}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={numberInput}
            onChangeText={setNumberInput}
            placeholder="Add number (e.g. 6)"
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
            <Text style={styles.emptyText}>Empty array — returns []</Text>
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

        <View style={styles.mappers}>
          {MAPPERS.map((item) => {
            const selected = item.key === selectedMapper;
            return (
              <Pressable
                key={item.key}
                style={[styles.mapper, selected && styles.mapperSelected]}
                onPress={() => handleSelectMapper(item.key)}
              >
                <Text style={[styles.mapperLabel, selected && styles.selectedText]}>
                  {item.label}
                </Text>
                <Text style={[styles.mapperCode, selected && styles.mapperCodeSelected]}>
                  {item.code}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton label="Run nativeMap in C++" onPress={() => runMap(selectedMapper)} />

        {error ? <ErrorBox message={error} /> : null}
        {result !== null ? (
          <ResultBox label="Mapped Result" value={JSON.stringify(result)} mono />
        ) : null}
      </DemoCard>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  count: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.pillText,
    backgroundColor: theme.colors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
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
  mappers: {
    gap: 8,
  },
  mapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  mapperSelected: {
    backgroundColor: theme.colors.chipSelected,
    borderColor: theme.colors.accent,
  },
  mapperLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textHeading,
  },
  mapperCode: {
    fontFamily: monoFont,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  mapperCodeSelected: {
    color: theme.colors.code,
  },
  selectedText: {
    color: theme.colors.accent,
  },
});
