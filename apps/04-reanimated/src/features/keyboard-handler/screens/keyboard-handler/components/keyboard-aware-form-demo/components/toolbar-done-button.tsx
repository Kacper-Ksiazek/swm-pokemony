import { type GestureResponderEvent, StyleSheet, TouchableOpacity } from "react-native";

type ToolbarDoneButtonProps = {
  children?: React.ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  testID: string;
};

export function ToolbarDoneButton({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ToolbarDoneButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      testID={testID}
      style={styles.donePill}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  donePill: {
    backgroundColor: "rgba(227, 53, 13, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
  },
});
