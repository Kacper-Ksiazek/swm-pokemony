import { EmptyState } from "@/shared/components/empty-state";

import type { PokemonMapViewProps } from "../../map-sheet.types";

export function PokemonMapView(_props: PokemonMapViewProps) {
  return <EmptyState message="Map is available on iOS." />;
}
