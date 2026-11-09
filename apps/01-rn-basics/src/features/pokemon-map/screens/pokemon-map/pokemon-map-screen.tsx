import { StyleSheet, View } from "react-native";

import { MapPinSheet, PokemonMapView } from "./components";
import { useMapPins } from "./hooks/use-map-pins";
import { MapSheetProvider } from "./map-sheet-context";

export function PokemonMapScreen() {
  const { pins } = useMapPins();

  return (
    <MapSheetProvider>
      <View style={styles.container}>
        <PokemonMapView pins={pins} />

        <MapPinSheet />
      </View>
    </MapSheetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
