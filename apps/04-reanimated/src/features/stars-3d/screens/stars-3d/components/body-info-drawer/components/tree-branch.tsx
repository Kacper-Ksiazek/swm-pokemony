import { StyleSheet, View } from "react-native";

import { theme } from "@/components/theme";

import type { TreeBranchProps } from "../body-info-drawer.types";

export function TreeBranch({ children, nested = false }: TreeBranchProps) {
  return (
    <View style={[styles.branchRow, nested && styles.branchRowNested]}>
      <View style={styles.branchLine} />
      <View style={styles.branchContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  branchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
  },
  branchRowNested: {
    paddingLeft: 26,
  },
  branchLine: {
    width: 12,
    height: 18,
    marginRight: 8,
    marginTop: -8,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderBottomLeftRadius: 6,
    borderColor: theme.colors.cardBorder,
  },
  branchContent: {
    flex: 1,
  },
});
