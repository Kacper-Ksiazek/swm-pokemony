import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import { COLORS } from "@/shared/styles/colors";

type SheetBodyProps = {
  children: ReactElement;
};

export function SheetBody({ children }: SheetBodyProps) {
  return <View style={styles.body}>{children}</View>;
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
});
