import { capitalize } from "es-toolkit/string";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { deleteMapPin } from "@/data/db";
import { pokemonSpriteUrl } from "@/data/pokemon-api";
import { SkeletonImage } from "@/shared/components/skeleton-image";
import { COLORS } from "@/shared/styles/colors";

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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${displayName}`}
        testID="remove-map-pin"
        onPress={handleRemove}
        style={styles.removeButton}
      >
        <SymbolView
          name={{ ios: "trash", android: "delete", web: "delete" }}
          size={20}
          tintColor="#ffffff"
        />
        <Text style={styles.removeLabel}>Remove</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: 12,
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111111",
  },
  coordinate: {
    fontSize: 14,
    color: "#666666",
  },
  removeButton: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
  },
  removeLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
