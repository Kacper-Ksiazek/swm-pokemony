import { StyleSheet, Text, View } from "react-native";

export function PokemonFavoriteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },
});
