import { capitalize } from "es-toolkit/string";
import { Image, type ImageRef } from "expo-image";
import type { AppleMaps } from "expo-maps";
import { useEffect, useRef, useState } from "react";

import type { MapPin } from "@/data/db";
import { pokemonThumbnailUrl } from "@/data/pokemon-api";

import { SPRITE_ANCHOR, SPRITE_DECODE_SIZE } from "../pokemon-map-view.constants";

export function usePinAnnotations(pins: MapPin[]): AppleMaps.Annotation[] {
  const [icons, setIcons] = useState<ReadonlyMap<number, ImageRef>>(() => new Map());
  const iconsRef = useRef(icons);

  useEffect(() => {
    iconsRef.current = icons;
  });

  useEffect(() => {
    let cancelled = false;
    const pokemonIds = new Set(pins.map((pin) => pin.pokemonId));

    for (const pokemonId of pokemonIds) {
      if (iconsRef.current.has(pokemonId)) {
        continue;
      }

      void Image.loadAsync(pokemonThumbnailUrl(pokemonId), {
        maxWidth: SPRITE_DECODE_SIZE,
        maxHeight: SPRITE_DECODE_SIZE,
      }).then((icon) => {
        if (cancelled || iconsRef.current.has(pokemonId)) {
          icon.release();
          return;
        }

        setIcons((current) => new Map(current).set(pokemonId, icon));
      });
    }

    return () => {
      cancelled = true;
    };
  }, [pins]);

  useEffect(() => {
    return () => {
      for (const icon of iconsRef.current.values()) {
        icon.release();
      }
    };
  }, []);

  return pins.flatMap((pin) => {
    const icon = icons.get(pin.pokemonId);
    if (!icon) {
      return [];
    }

    return [
      {
        id: String(pin.id),
        coordinates: { latitude: pin.latitude, longitude: pin.longitude },
        title: capitalize(pin.name),
        icon,
        anchor: SPRITE_ANCHOR,
      },
    ];
  });
}
