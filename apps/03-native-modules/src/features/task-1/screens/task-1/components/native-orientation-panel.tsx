import { StyleSheet, Text, View } from "react-native";

export function NativeOrientationPanel() {
  return (
    <View style={styles.panel}>
      <Text>Native Orientation Panel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
