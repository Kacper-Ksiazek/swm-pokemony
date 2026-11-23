import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardController, KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/components/theme";

import { ApiCodeBlock } from "./api-code-block";

const KEYBOARD_STICKY_VIEW_API = [
  { api: "KeyboardStickyView", detail: "enabled · offset" },
  { api: "KeyboardController.dismiss()" },
] as const;

export function KeyboardStickyViewDemo() {
  const [message, setMessage] = useState("");
  const [stickyEnabled, setStickyEnabled] = useState(true);
  const [extraOpenedOffset, setExtraOpenedOffset] = useState(false);

  const insets = useSafeAreaInsets();

  const containerBottomPadding = Math.max(insets.bottom, 12);
  const baseOpenedOffset = 32 + containerBottomPadding - 6;
  const openedOffset = baseOpenedOffset - (extraOpenedOffset ? 14 : 0);

  return (
    <View style={[styles.container, { paddingBottom: containerBottomPadding }]}>
      <View style={styles.infoCard}>
        <Text style={styles.eyebrow}>2 · KeyboardStickyView</Text>

        <ApiCodeBlock items={KEYBOARD_STICKY_VIEW_API} />

        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => setStickyEnabled((prev) => !prev)}
            style={[styles.toggleChip, stickyEnabled && styles.toggleChipActive]}
          >
            <Text style={[styles.toggleLabel, stickyEnabled && styles.toggleLabelActive]}>
              enabled: {stickyEnabled ? "true" : "false"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setExtraOpenedOffset((prev) => !prev)}
            style={[styles.toggleChip, extraOpenedOffset && styles.toggleChipActive]}
          >
            <Text style={[styles.toggleLabel, extraOpenedOffset && styles.toggleLabelActive]}>
              gap: {extraOpenedOffset ? "+14px" : "0px"}
            </Text>
          </Pressable>
        </View>
      </View>

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Focus here to see the sticky footer follow…"
        placeholderTextColor={theme.colors.textMuted}
        multiline
        style={styles.noteInput}
      />

      <KeyboardStickyView
        enabled={stickyEnabled}
        offset={{ closed: 0, opened: openedOffset }}
        style={styles.stickyBar}
      >
        <Text style={styles.stickyMeta}>
          {message.length > 0 ? `${message.length} chars` : "Ready"}
        </Text>

        <Pressable onPress={() => KeyboardController.dismiss()} style={styles.actionButton}>
          <Text style={styles.actionLabel}>Done</Text>
        </Pressable>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 10,
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
  },
  toggleChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggleChipActive: {
    backgroundColor: theme.colors.chipSelected,
    borderColor: theme.colors.accent,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  toggleLabelActive: {
    color: theme.colors.accent,
  },
  noteInput: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    padding: 14,
    fontSize: 15,
    color: theme.colors.textPrimary,
    textAlignVertical: "top",
  },
  stickyBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stickyMeta: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  actionButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.surface,
  },
});
