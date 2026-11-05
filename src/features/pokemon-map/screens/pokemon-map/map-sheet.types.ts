import type { MapPin } from "@/data/db";

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type PokemonMapViewProps = {
  pins: MapPin[];
};
