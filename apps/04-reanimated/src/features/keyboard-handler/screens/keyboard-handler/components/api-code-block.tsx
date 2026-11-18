import { Platform, StyleSheet, Text, View } from "react-native";

import { theme } from "@/components/theme";

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export type ApiItem = {
  api: string;
  detail?: string;
};

type ApiCodeBlockProps = {
  items: readonly ApiItem[];
};

export function ApiCodeBlock({ items }: ApiCodeBlockProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.api} style={styles.row}>
          <Text style={styles.api}>{item.api}</Text>
          {item.detail ? <Text style={styles.detail}>{item.detail}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  row: {
    gap: 2,
  },
  api: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    color: theme.colors.code,
  },
  detail: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    lineHeight: 15,
    color: theme.colors.textSecondary,
    paddingLeft: 10,
  },
});
