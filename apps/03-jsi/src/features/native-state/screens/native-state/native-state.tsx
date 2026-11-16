import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { DemoCard } from "@/components/demo-card";
import { DemoScreen, monoFont } from "@/components/demo-screen";
import { PrimaryButton } from "@/components/primary-button";
import { ResultBox } from "@/components/result-box";
import { theme } from "@/components/theme";

/** #15 NativeState: attach a native counter to a plain JS object without adding JS keys. */
export function NativeStateScreen() {
  const objectRef = useRef<Record<string, unknown>>({});
  const [count, setCount] = useState<number | null>(null);
  const [jsKeys, setJsKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSend = useCallback(() => {
    try {
      const nextCount = globalThis.trackNativeState(objectRef.current);
      setCount(nextCount);
      setJsKeys(Object.keys(objectRef.current));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "trackNativeState failed.");
    }
  }, []);

  const handleNewObject = useCallback(() => {
    objectRef.current = {};
    setCount(null);
    setJsKeys([]);
    setError(null);
  }, []);

  return (
    <DemoScreen
      badge="jsi::NativeState"
      title="Native State"
      action={{ label: "New Object", onPress: handleNewObject }}
    >
      <DemoCard eyebrow="NATIVE STATE" title="trackNativeState(simpleObject)">
        <Text style={styles.description}>
          Sends the same plain JS object to C++. C++ attaches a CounterNativeState via
          setNativeState without mutating JS properties.
        </Text>

        <PrimaryButton label="Send simpleObject to C++" onPress={handleSend} />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {count !== null ? (
          <View style={styles.resultWrap}>
            <ResultBox label="Native Visit Count" value={count} />
            <Text style={styles.metaText}>Object.keys(simpleObject): {JSON.stringify(jsKeys)}</Text>
          </View>
        ) : null}
      </DemoCard>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
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
  metaText: {
    fontFamily: monoFont,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
