import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { DemoCard, DemoSmallButton } from "@/components/demo-card";
import { DemoScreen, monoFont } from "@/components/demo-screen";
import { PrimaryButton, SecondaryButton } from "@/components/primary-button";
import { ResultBox } from "@/components/result-box";
import { theme } from "@/components/theme";

/** #14 getInfinityObject: reads increment a native counter, writes decrement it. */
export function InfinityScreen() {
  const infinityRef = useRef<JsiInfinityHostObject | null>(null);
  if (infinityRef.current === null) {
    infinityRef.current = globalThis.getInfinityObject();
  }

  const [prop, setProp] = useState("ojbob");
  const [value, setValue] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleRead = useCallback(() => {
    const hostObj = infinityRef.current;
    const name = prop.trim() || "a";
    if (!hostObj) return;
    const next = hostObj[name];
    setValue(next);
    setLastAction(`Read infinityObject.${name} → ${next}`);
  }, [prop]);

  const handleWrite = useCallback(() => {
    const hostObj = infinityRef.current;
    const name = prop.trim() || "x";
    if (!hostObj) return;
    hostObj[name] = 0;
    setLastAction(`Wrote infinityObject.${name} = 0 (counter--)`);
  }, [prop]);

  const handleRefresh = useCallback(() => {
    const hostObj = infinityRef.current;
    if (!hostObj) return;
    const next = globalThis.peekInfinityCounter(hostObj);
    setValue(next);
    setLastAction(`Refreshed counter → ${next} (without read)`);
  }, []);

  const handleNewInstance = useCallback(() => {
    infinityRef.current = globalThis.getInfinityObject();
    setValue(null);
    setLastAction("Created fresh getInfinityObject()");
  }, []);

  return (
    <DemoScreen
      badge="jsi::HostObject"
      title="Infinity"
      action={{ label: "New Instance", onPress: handleNewInstance }}
    >
      <DemoCard
        eyebrow="HOSTOBJECT"
        title="InfinityObject"
        headerRight={<DemoSmallButton label="Refresh" onPress={handleRefresh} />}
      >
        <TextInput
          style={styles.input}
          value={prop}
          onChangeText={setProp}
          placeholder="Any property name (e.g. ojbob)"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.row}>
          <SecondaryButton label="Write (= 0)" onPress={handleWrite} />
          <PrimaryButton label="Read (.prop)" onPress={handleRead} />
        </View>

        {value !== null || lastAction ? (
          <View style={styles.result}>
            <ResultBox label="Counter Value" value={value !== null ? value : "—"} />
            {lastAction ? <Text style={styles.action}>{lastAction}</Text> : null}
          </View>
        ) : null}
      </DemoCard>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  result: {
    gap: 8,
  },
  action: {
    fontFamily: monoFont,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
