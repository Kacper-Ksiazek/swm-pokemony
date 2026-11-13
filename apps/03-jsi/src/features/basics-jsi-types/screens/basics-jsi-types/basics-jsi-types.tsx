import { useCallback, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type NativeData = {
  counter: number;
  answer: number;
  isWednesday: boolean;
  workshopName: string;
  myAwesomeArray: [number, boolean, string];
};

type JsiFunctionEntry = {
  name: "increment" | "decrement" | "calculate" | "transformString";
  signature: string;
  description: string;
  available: boolean;
};

const JSI_FUNCTION_SPECS: {
  name: JsiFunctionEntry["name"];
  signature: string;
  description: string;
}[] = [
  {
    name: "increment",
    signature: "() => number",
    description: "Increments native C++ counter by 1",
  },
  {
    name: "decrement",
    signature: "() => number",
    description: "Decrements native C++ counter by 1",
  },
  {
    name: "calculate",
    signature: '(args: number[], operation: "add" | "subtract" | "multiply") => number',
    description: "Reduces a number array in C++ using add, subtract, or multiply",
  },
  {
    name: "transformString",
    signature:
      '(str: string, operation: "uppercase" | "lowercase" | "reverse" | "capitalize" | "shuffle" | "blur") => string',
    description:
      "Transforms a string in C++ using uppercase, lowercase, reverse, capitalize, shuffle, or blur",
  },
];

function readNativeData(): NativeData {
  return {
    answer: globalThis.answerToTheUltimateQuestionOfLifeTheUniverseAndEverything,
    isWednesday: globalThis.isWednesday,
    workshopName: globalThis.workshopName,
    myAwesomeArray: globalThis.myAwesomeArray,
    counter: globalThis.counter,
  };
}

function readFunctionRegistry(): JsiFunctionEntry[] {
  return JSI_FUNCTION_SPECS.map((spec) => ({
    ...spec,
    available: typeof globalThis[spec.name] === "function",
  }));
}

export function BasicsJsiTypesScreen() {
  const [values, setValues] = useState<NativeData>(readNativeData);
  const [functions, setFunctions] = useState<JsiFunctionEntry[]>(readFunctionRegistry);

  const handleRefresh = useCallback(() => {
    setValues(readNativeData());
    setFunctions(readFunctionRegistry());
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>C++ ↔ JS Bridge</Text>
            </View>
            <Text style={styles.title}>Native Data</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.refreshButton, pressed && styles.buttonPressed]}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonLabel}>Refresh</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardEyebrow}>GLOBALTHIS SNAPSHOT</Text>
            <Text style={styles.pill}>JSON</Text>
          </View>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{JSON.stringify(values, null, 2)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardEyebrow}>FUNCTION REGISTRY</Text>
            <Text style={styles.pill}>{functions.filter((fn) => fn.available).length} HOST FN</Text>
          </View>

          <View style={styles.registryList}>
            {functions.map((fn) => (
              <View key={fn.name} style={styles.registryRow}>
                <View style={styles.registryRowHeader}>
                  <View style={styles.registryNameRow}>
                    <View
                      style={[
                        styles.statusDot,
                        fn.available ? styles.statusDotReady : styles.statusDotMissing,
                      ]}
                    />
                    <Text style={styles.registryName}>globalThis.{fn.name}</Text>
                  </View>
                  <Text
                    style={[
                      styles.registryStatus,
                      fn.available ? styles.registryStatusReady : styles.registryStatusMissing,
                    ]}
                  >
                    {fn.available ? "HostFunction" : "Missing"}
                  </Text>
                </View>

                <Text style={styles.registrySignature}>{fn.signature}</Text>
                <Text style={styles.registryDescription}>{fn.description}</Text>
              </View>
            ))}
          </View>
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
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#64748B",
  },
  pill: {
    fontSize: 11,
    fontWeight: "700",
    color: "#818CF8",
    backgroundColor: "#1E2547",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  codeBlock: {
    backgroundColor: "#080C18",
    borderWidth: 1,
    borderColor: "#1C2642",
    borderRadius: 14,
    padding: 14,
  },
  codeText: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 13,
    lineHeight: 20,
    color: "#A5F3FC",
  },
  registryList: {
    gap: 10,
  },
  registryRow: {
    backgroundColor: "#0A0F1E",
    borderWidth: 1,
    borderColor: "#1C2642",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  registryRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  registryNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusDotReady: {
    backgroundColor: "#34D399",
  },
  statusDotMissing: {
    backgroundColor: "#FB7185",
  },
  registryName: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 13,
    fontWeight: "600",
    color: "#F8FAFC",
  },
  registryStatus: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  registryStatusReady: {
    color: "#34D399",
    backgroundColor: "#0F2A24",
  },
  registryStatusMissing: {
    color: "#FDA4AF",
    backgroundColor: "#2D121D",
  },
  registrySignature: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 12,
    color: "#38BDF8",
  },
  registryDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: "#94A3B8",
  },
});
