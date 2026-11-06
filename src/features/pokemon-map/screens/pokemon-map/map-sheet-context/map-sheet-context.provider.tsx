import { type ReactNode, useState } from "react";

import { MapSheetContext } from "./map-sheet-context";
import type { OpenMapSheetArgs } from "./map-sheet-context.types";

type MapSheetProviderProps = {
  children: ReactNode;
};

export function MapSheetProvider({ children }: MapSheetProviderProps) {
  const [opened, setOpened] = useState<OpenMapSheetArgs | null>(null);

  function open(args: OpenMapSheetArgs) {
    if (opened !== null) {
      return;
    }

    setOpened(args);
  }

  function close() {
    setOpened(null);
  }

  return (
    <MapSheetContext.Provider
      value={{
        opened,
        currentlyOpened: opened?.sheet ?? null,
        open,
        close,
      }}
    >
      {children}
    </MapSheetContext.Provider>
  );
}
