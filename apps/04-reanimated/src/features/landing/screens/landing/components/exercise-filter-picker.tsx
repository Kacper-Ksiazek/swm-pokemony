import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { EXERCISE_FILTER_LABELS, type ExerciseFilter } from "../landing-data";

const FILTER_OPTIONS: ExerciseFilter[] = ["all", "todo", "done"];

type ExerciseFilterPickerProps = {
  value: ExerciseFilter;
  onChange: (value: ExerciseFilter) => void;
};

export function ExerciseFilterPicker({ value, onChange }: ExerciseFilterPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Filtr statusu"
      >
        <Text style={styles.triggerLabel} numberOfLines={1}>
          {EXERCISE_FILTER_LABELS[value]}
        </Text>
        <IconSymbol name="chevron.down" size={18} color={theme.colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Status</Text>
            {FILTER_OPTIONS.map((option) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {EXERCISE_FILTER_LABELS[option]}
                  </Text>
                  {selected ? <Text style={styles.checkmark}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
  },
  triggerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 20, 0.35)",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg + 2,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: 16,
    gap: 8,
  },
  sheetTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionSelected: {
    backgroundColor: theme.colors.chipSelected,
  },
  optionLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  optionLabelSelected: {
    fontWeight: "600",
    color: theme.colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.accent,
  },
});
