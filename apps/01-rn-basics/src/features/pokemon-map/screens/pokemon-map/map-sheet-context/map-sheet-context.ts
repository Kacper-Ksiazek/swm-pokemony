import { createContext, useContext } from "react";

import type { MapSheet, MapSheetContextValue, MapSheetPayloads } from "./map-sheet-context.types";

export const MapSheetContext = createContext<MapSheetContextValue | null>(null);

export function useMapSheetContext(): MapSheetContextValue {
  const context = useContext(MapSheetContext);

  if (context === null) {
    throw new Error("useMapSheetContext must be used within MapSheetProvider");
  }

  return context;
}

export function useMapSheetPayload<S extends MapSheet>(sheet: S): MapSheetPayloads[S] | null {
  const { opened } = useMapSheetContext();

  if (opened?.sheet !== sheet) {
    return null;
  }

  return opened.payload as MapSheetPayloads[S];
}
