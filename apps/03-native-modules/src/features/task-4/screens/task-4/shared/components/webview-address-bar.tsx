import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { WEBVIEW_PRESETS } from "../utils/normalize-web-url";

type WebViewAddressBarProps = {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onPreset: (url: string) => void;
};

export function WebViewAddressBar({
  value,
  error,
  onChange,
  onSubmit,
  onPreset,
}: WebViewAddressBarProps) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          placeholder="https://…"
          placeholderTextColor="#999999"
          accessibilityLabel="Adres strony"
          style={styles.input}
        />
        <Pressable accessibilityRole="button" onPress={onSubmit} style={styles.go}>
          <Text style={styles.goLabel}>Otwórz</Text>
        </Pressable>
      </View>

      <View style={styles.presets}>
        {WEBVIEW_PRESETS.map((preset) => (
          <Pressable
            key={preset.label}
            accessibilityRole="button"
            onPress={() => onPreset(preset.url)}
            style={styles.preset}
          >
            <Text style={styles.presetLabel}>{preset.label}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  go: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  goLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  presets: {
    flexDirection: "row",
    gap: 8,
  },
  preset: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0f2f5",
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
  },
  error: {
    fontSize: 13,
    color: "#b42318",
  },
});
