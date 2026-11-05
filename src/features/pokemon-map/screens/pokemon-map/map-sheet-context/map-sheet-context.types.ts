import type { MapPin } from "@/data/db";

import type { MapCoordinate } from "../map-sheet.types";

export type MapSheetPayloads = {
  "pokemon-picker": MapCoordinate;
  "pin-detail": MapPin;
};

export type MapSheet = keyof MapSheetPayloads;

export type OpenMapSheetArgs = {
  [S in MapSheet]: { sheet: S; payload: MapSheetPayloads[S] };
}[MapSheet];

export type MapSheetContextValue = {
  opened: OpenMapSheetArgs | null;
  currentlyOpened: MapSheet | null;

  open: (args: OpenMapSheetArgs) => void;
  close: () => void;
};
