import { BottomSheet } from "@expo/ui";
import { StyleSheet, View } from "react-native";

import { COLORS } from "@/shared/styles/colors";

import { useMapSheetContext } from "../../map-sheet-context";
import { PinDetail } from "./variants/pin-detail";
import { PokemonPicker } from "./variants/pokemon-picker";
import { SheetBody } from "./variants/sheet-body";

export function MapPinSheet() {
  const { currentlyOpened, close } = useMapSheetContext();

  const isPicker = currentlyOpened === "pokemon-picker";

  return (
    <BottomSheet
      isPresented={currentlyOpened !== null}
      onDismiss={close}
      snapPoints={isPicker ? ["full"] : ["half"]}
      containerColor={COLORS.BACKGROUND}
    >
      <SheetBody>
        <View style={styles.content}>
          <MapPinSheetBody />
        </View>
      </SheetBody>
    </BottomSheet>
  );
}

function MapPinSheetBody() {
  const { currentlyOpened } = useMapSheetContext();

  switch (currentlyOpened) {
    case "pokemon-picker":
      return <PokemonPicker />;

    case "pin-detail":
      return <PinDetail />;

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
});
