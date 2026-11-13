import { useCallback, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type StringOperation = "uppercase" | "lowercase" | "reverse" | "capitalize" | "shuffle" | "blur";

const STRING_OPERATIONS: { value: StringOperation; label: string }[] = [
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "reverse", label: "Reverse" },
  { value: "capitalize", label: "Capitalize" },
  { value: "shuffle", label: "Shuffle" },
  { value: "blur", label: "Blur" },
];

export function StringsScreen() {
  const [input, setInput] = useState("JSI workshop");
  const [operation, setOperation] = useState<StringOperation>("uppercase");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransform = useCallback(
    (nextOperation: StringOperation = operation) => {
      try {
        const output = globalThis.transformString(input, nextOperation);
        setResult(output);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "String transform failed.");
      }
    },
    [input, operation],
  );

  const handleSelectOperation = useCallback(
    (nextOperation: StringOperation) => {
      setOperation(nextOperation);
      handleTransform(nextOperation);
    },
    [handleTransform],
  );

  const handleReset = useCallback(() => {
    setInput("JSI workshop");
    setResult(null);
    setError(null);
  }, []);

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
            <Text style={styles.title}>JSI Strings</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.resetButton, pressed && styles.buttonPressed]}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonLabel}>Reset</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEyebrow}>HOST FUNCTION</Text>
              <Text style={styles.cardTitle}>transformString(str, op)</Text>
            </View>
            <Text style={styles.charCount}>{input.length}/100</Text>
          </View>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Enter 2–100 characters..."
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => handleTransform()}
          />

          <View style={styles.operationsGrid}>
            {STRING_OPERATIONS.map((item) => {
              const selected = item.value === operation;
              return (
                <Pressable
                  key={item.value}
                  style={({ pressed }) => [
                    styles.operationChip,
                    selected && styles.operationChipSelected,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => handleSelectOperation(item.value)}
                >
                  <Text
                    style={[
                      styles.operationChipLabel,
                      selected && styles.operationChipLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={({ pressed }) => [styles.transformButton, pressed && styles.buttonPressed]}
            onPress={() => handleTransform()}
          >
            <Text style={styles.transformButtonLabel}>Transform in C++</Text>
          </Pressable>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {result !== null ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Output ({operation})</Text>
              <Text style={styles.resultValue}>{result}</Text>
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
  resetButton: {
    backgroundColor: "#18223F",
    borderWidth: 1,
    borderColor: "#2E3E6B",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resetButtonLabel: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
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
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  charCount: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  input: {
    backgroundColor: "#0A0F1E",
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#F8FAFC",
    fontSize: 15,
  },
  operationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  operationChip: {
    backgroundColor: "#0A0F1E",
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  operationChipSelected: {
    backgroundColor: "#172554",
    borderColor: "#38BDF8",
  },
  operationChipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  operationChipLabelSelected: {
    color: "#38BDF8",
  },
  transformButton: {
    backgroundColor: "#2563EB",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  transformButtonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#2D121D",
    borderWidth: 1,
    borderColor: "#881337",
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: "#FDA4AF",
    fontSize: 13,
    fontWeight: "600",
  },
  resultBox: {
    backgroundColor: "#0A0F1E",
    borderWidth: 1,
    borderColor: "#1E2A4A",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  resultValue: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 16,
    fontWeight: "600",
    color: "#34D399",
  },
});
