import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/components/theme";

import { ApiCodeBlock } from "../api-code-block";
import { AnimatedKeyboardToolbar } from "./components/animated-keyboard-toolbar";
import { DemoFormFields } from "./components/demo-form-fields";
import { DemoFormScrollContainer } from "./components/demo-form-scroll-container";
import type { FormKey } from "./keyboard-aware-form-demo.types";

const EMPTY_FORM_VALUES: Record<FormKey, string> = {
  name: "",
  region: "",
  starter: "",
  badge: "",
  notes: "",
};

const KEYBOARD_AWARE_FORM_API = [
  { api: "KeyboardAwareScrollView", detail: "bottomOffset · extraKeyboardSpace" },
  { api: "KeyboardToolbar", detail: ".Background · .Prev · .Next · .Content · .Done" },
  { api: "useKeyboardHandler", detail: "onStart · onEnd" },
] as const;

/** Demo tab: KeyboardAwareScrollView with a custom KeyboardToolbar overlay. */
export function KeyboardAwareFormDemo() {
  const [values, setValues] = useState<Record<FormKey, string>>(EMPTY_FORM_VALUES);
  const [keyboardAware, setKeyboardAware] = useState(true);
  const insets = useSafeAreaInsets();
  const scrollContentPaddingBottom = Math.max(insets.bottom, 24) + 56;

  function onFieldChange(key: FormKey, next: string) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  return (
    <View style={styles.container}>
      <DemoFormScrollContainer
        keyboardAware={keyboardAware}
        contentPaddingBottom={scrollContentPaddingBottom}
      >
        <View style={styles.infoCard}>
          <Text style={styles.eyebrow}>3 · KeyboardAwareScrollView + KeyboardToolbar</Text>
          <ApiCodeBlock items={KEYBOARD_AWARE_FORM_API} />

          <View style={styles.controlsRow}>
            <Pressable
              onPress={() => setKeyboardAware(true)}
              style={[styles.toggleChip, keyboardAware && styles.toggleChipActive]}
            >
              <Text style={[styles.toggleLabel, keyboardAware && styles.toggleLabelActive]}>
                KeyboardAwareScrollView
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setKeyboardAware(false)}
              style={[styles.toggleChip, !keyboardAware && styles.toggleChipActive]}
            >
              <Text style={[styles.toggleLabel, !keyboardAware && styles.toggleLabelActive]}>
                ScrollView
              </Text>
            </Pressable>
          </View>
        </View>

        <DemoFormFields values={values} onFieldChange={onFieldChange} />
      </DemoFormScrollContainer>

      <AnimatedKeyboardToolbar insets={insets} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: theme.colors.accent,
  },
  controlsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  toggleChip: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
  },
  toggleChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.pillBg,
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  toggleLabelActive: {
    color: theme.colors.pillText,
  },
});
