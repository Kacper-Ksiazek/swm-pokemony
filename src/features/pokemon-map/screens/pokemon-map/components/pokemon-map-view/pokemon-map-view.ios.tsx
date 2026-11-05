import { AppleMaps } from "expo-maps";
import { useRef } from "react";
import { StyleSheet } from "react-native";

import type { PokemonMapViewProps } from "../../map-sheet.types";
import { useMapInteractions, usePinAnnotations } from "./hooks";
import { INITIAL_CAMERA } from "./pokemon-map-view.constants";

export function PokemonMapView({ pins }: PokemonMapViewProps) {
  const mapRef = useRef<AppleMaps.MapView>(null);

  const annotations = usePinAnnotations(pins);
  const { handleMapClick, handleAnnotationClick } = useMapInteractions(pins);

  return (
    <AppleMaps.View
      ref={mapRef}
      style={styles.map}
      cameraPosition={INITIAL_CAMERA}
      properties={{ selectionEnabled: false }}
      annotations={annotations}
      onMapClick={handleMapClick}
      onAnnotationClick={(event) => {
        handleAnnotationClick(event);
        mapRef.current?.selectAnnotation();
      }}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
