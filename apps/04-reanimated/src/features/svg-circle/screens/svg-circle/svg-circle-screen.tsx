import { StyleSheet, View } from "react-native";

import { DemoScreen } from "@/components/demo-screen";

import { LineToCircle } from "./components/line-to-circle";

export function SvgCircleScreen() {
  return (
    <DemoScreen>
      <View style={styles.section}>
        <LineToCircle />
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
