import type { AppleMaps, Coordinates } from "expo-maps";

import type { MapPin } from "@/data/db";

import { useMapSheetContext } from "../../../map-sheet-context";

export function useMapInteractions(pins: MapPin[]) {
  const { open } = useMapSheetContext();

  function handleMapClick(event: { coordinates: Coordinates }) {
    const { latitude, longitude } = event.coordinates;

    if (latitude === undefined || longitude === undefined) {
      return;
    }

    open({ sheet: "pokemon-picker", payload: { latitude, longitude } });
  }

  function handleAnnotationClick(annotation: AppleMaps.Annotation) {
    const pinId = Number(annotation.id);
    const pin = pins.find((item) => item.id === pinId);

    if (!pin) {
      return;
    }

    open({ sheet: "pin-detail", payload: pin });
  }

  return {
    handleMapClick,
    handleAnnotationClick,
  };
}
