import { StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "@/components/theme";

import { FORM_FIELDS } from "../keyboard-aware-form-demo.constants";
import type { FormKey } from "../keyboard-aware-form-demo.types";

type DemoFormFieldsProps = {
  values: Record<FormKey, string>;
  onFieldChange: (key: FormKey, next: string) => void;
};

export function DemoFormFields({ values, onFieldChange }: DemoFormFieldsProps) {
  return (
    <>
      {FORM_FIELDS.map((field) => {
        const isMultiline = "multiline" in field && field.multiline;

        return (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={styles.label}>{field.label}</Text>

            <TextInput
              value={values[field.key]}
              onChangeText={(next) => onFieldChange(field.key, next)}
              placeholder={field.placeholder}
              placeholderTextColor={theme.colors.textMuted}
              multiline={isMultiline}
              style={[styles.input, isMultiline && styles.multilineInput]}
            />
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textHeading,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
});
