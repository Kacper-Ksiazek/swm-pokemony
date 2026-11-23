import { ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "@/components/theme";

import type { HierarchySectionProps } from "../body-info-drawer.types";
import { BodyChip } from "./body-chip";
import { TreeBranch } from "./tree-branch";

export function HierarchySection({
  bodyIndex,
  body,
  parent,
  siblings,
  childBodies,
  onSelectBody,
  onRefocus,
}: HierarchySectionProps) {
  return (
    <View style={styles.hierarchySection}>
      <Text style={styles.groupLabel}>Pozycja w układzie</Text>

      {parent ? (
        <>
          <View style={styles.rootRow}>
            <BodyChip item={parent} onPress={() => onSelectBody(parent.index)} />
          </View>
          <TreeBranch>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollChips}
            >
              {siblings.map((sibling) => (
                <BodyChip
                  key={sibling.body.id}
                  item={sibling}
                  active={sibling.index === bodyIndex}
                  onPress={() => onSelectBody(sibling.index)}
                />
              ))}
            </ScrollView>
          </TreeBranch>
        </>
      ) : (
        <View style={styles.rootRow}>
          <BodyChip item={{ index: bodyIndex, body }} active onPress={() => onRefocus(bodyIndex)} />
        </View>
      )}

      {childBodies.length > 0 && (
        <TreeBranch nested={parent !== null}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollChips}
          >
            {childBodies.map((child) => (
              <BodyChip
                key={child.body.id}
                item={child}
                onPress={() => onSelectBody(child.index)}
              />
            ))}
          </ScrollView>
        </TreeBranch>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hierarchySection: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    paddingTop: 10,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  rootRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollChips: {
    gap: 8,
    paddingRight: 4,
  },
});
