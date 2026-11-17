import { StyleSheet, View } from "react-native";
import { useIsFocused } from "expo-router";

import { DemoScreen } from "@/components/demo-screen";

import { LineToCircle } from "./components/line-to-circle";

export function SvgCircleScreen() {
  const isFocused = useIsFocused();

  return (
    <DemoScreen>
      <View style={styles.section}>
        <LineToCircle isActive={isFocused} />
      </View>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    gap: 16,
  },
});
