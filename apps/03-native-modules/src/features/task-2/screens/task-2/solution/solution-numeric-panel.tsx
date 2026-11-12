import {
  KksiazekNumericTextComposeView,
  KksiazekNumericTextSwiftUIView,
} from "kksiazek-numeric-text";
import { Platform, StyleSheet, Text, View } from "react-native";

import { formatThreeDigitValue } from "../shared";

type SolutionNumericPanelProps = {
  value: number;
  onAdd: () => void;
  onSubtract: () => void;
};

const NativeNumericView =
  Platform.OS === "ios" ? KksiazekNumericTextSwiftUIView : KksiazekNumericTextComposeView;

export function SolutionNumericPanel({
  value,
  onAdd: _onAdd,
  onSubtract: _onSubtract,
}: SolutionNumericPanelProps) {
  const title = formatThreeDigitValue(value);

  return (
    <View style={styles.panel}>
      <Text style={styles.packageName}>kksiazek-numeric-text</Text>
      <Text style={styles.badge}>Faza 1 — szkielet UI</Text>

      <View style={styles.nativeView}>
        <NativeNumericView title={title} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  packageName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    fontFamily: "Menlo",
  },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d6a4f",
    backgroundColor: "#eaf4ee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  nativeView: {
    width: "100%",
    minHeight: 240,
  },
});
