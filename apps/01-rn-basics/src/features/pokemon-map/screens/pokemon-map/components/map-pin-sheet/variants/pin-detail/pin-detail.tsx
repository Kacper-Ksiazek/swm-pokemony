import { capitalize } from "es-toolkit/string";
import { StyleSheet, Text, View } from "react-native";

import { deleteMapPin } from "@/data/db";
import { pokemonSpriteUrl } from "@/data/pokemon-api";
import { Button } from "@/shared/components/button";
import { SkeletonImage } from "@/shared/components/skeleton-image";
import { COLORS, SPACING } from "@/shared/styles/colors";

import { useMapSheetContext, useMapSheetPayload } from "../../../../map-sheet-context";

export function PinDetail() {
  const { close } = useMapSheetContext();
  const pin = useMapSheetPayload("pin-detail");

  if (pin === null) {
    return null;
  }

  const displayName = capitalize(pin.name);

  function handleRemove() {
    if (pin === null) {
      return;
    }

    deleteMapPin(pin.id);
    close();
  }

  return (
    <View style={styles.container}>
      <SkeletonImage uri={pokemonSpriteUrl(pin.pokemonId)} loadKey={pin.id} size={160} />

      <Text style={styles.name}>{displayName}</Text>

      <Text style={styles.coordinate}>
        {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}
      </Text>

      <Button
        variant="secondary"
        label="Remove"
        accessibilityLabel={`Remove ${displayName}`}
        icon={{ ios: "trash", android: "delete", web: "delete" }}
        testID="remove-map-pin"
        onPress={handleRemove}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: SPACING.md,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.TEXT,
  },
  coordinate: {
    fontSize: 14,
    color: COLORS.TEXT_MUTED,
  },
});
