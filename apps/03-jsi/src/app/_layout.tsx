import { useLayoutEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeTabs } from "expo-router/native-tabs";
import { StatusBar } from "expo-status-bar";

import { setupJsiBindings } from "kksiazek-jsi";

type JsiInitState = {
  ready: boolean;
  error: string | null;
};

export default function RootLayout() {
  const [jsiState, setJsiState] = useState<JsiInitState>({
    ready: false,
    error: null,
  });

  useLayoutEffect(() => {
    try {
      setupJsiBindings();
      setJsiState({ ready: true, error: null });
    } catch (err) {
      setJsiState({
        ready: false,
        error: err instanceof Error ? err.message : "JSI setup failed.",
      });
    }
  }, []);

  if (jsiState.error) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>JSI setup failed</Text>
          <Text style={styles.error}>{jsiState.error}</Text>
        </View>
      </View>
    );
  }

  if (!jsiState.ready) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <NativeTabs tintColor="#38BDF8">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Native Data</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="cpu.fill" md="memory" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="counter">
        <NativeTabs.Trigger.Label>Counter</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plusminus.circle.fill" md="exposure" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="strings">
        <NativeTabs.Trigger.Label>Strings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="textformat.abc" md="text_fields" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1020",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorCard: {
    backgroundColor: "#2D121D",
    borderWidth: 1,
    borderColor: "#881337",
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FDA4AF",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFE4E6",
  },
});
