import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";

type SheetBodyProps = {
  children: ReactElement;
};

export function SheetBody({ children }: SheetBodyProps) {
  return <View style={styles.body}>{children}</View>;
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
