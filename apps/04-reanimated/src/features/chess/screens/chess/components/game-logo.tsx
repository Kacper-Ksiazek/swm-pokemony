import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { CHESS_LOGO_IMAGE } from "../../../assets/chess-assets";

export function GameLogo() {
  return (
    <View
      style={styles.frame}
      accessibilityRole="image"
      accessibilityLabel="Poké Chess Vice Edition"
    >
      <Image source={CHESS_LOGO_IMAGE} style={styles.image} contentFit="contain" transition={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
