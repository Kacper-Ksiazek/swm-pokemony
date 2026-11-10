import { StyleSheet, Text, View } from "react-native";

export function Task4Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#111111",
  },
});
