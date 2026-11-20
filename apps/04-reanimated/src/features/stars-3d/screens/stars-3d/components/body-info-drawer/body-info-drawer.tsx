import { type LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/components/theme";

import { BodyFactsRow } from "./components/body-facts-row";
import { DrawerHeader } from "./components/drawer-header";
import { HierarchySection } from "./components/hierarchy-section";
import type { BodyInfoDrawerProps } from "./body-info-drawer.types";
import { buildBodyHierarchy } from "./utils/build-body-hierarchy";

export function BodyInfoDrawer({
  bodyIndex,
  onSelectBody,
  onRefocus,
  onClose,
  onHeightChange,
}: BodyInfoDrawerProps) {
  const insets = useSafeAreaInsets();

  if (bodyIndex === null) {
    return null;
  }

  const hierarchy = buildBodyHierarchy(bodyIndex);

  if (!hierarchy) {
    return null;
  }

  const { body, parent, siblings, children: childBodies } = hierarchy;

  const handleLayout = (event: LayoutChangeEvent) => {
    onHeightChange(event.nativeEvent.layout.height);
  };

  return (
    <Animated.View
      entering={SlideInDown.duration(260)}
      exiting={SlideOutDown.duration(200)}
      onLayout={handleLayout}
      style={[styles.drawer, { paddingBottom: Math.max(20, insets.bottom + 10) }]}
    >
      <View style={styles.handle} />

      <DrawerHeader body={body} bodyIndex={bodyIndex} onRefocus={onRefocus} onClose={onClose} />

      <BodyFactsRow facts={body.facts} />

      <Text style={styles.description}>{body.description}</Text>

      <HierarchySection
        bodyIndex={bodyIndex}
        body={body}
        parent={parent}
        siblings={siblings}
        childBodies={childBodies}
        onSelectBody={onSelectBody}
        onRefocus={onRefocus}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    borderTopWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
    zIndex: 200000,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.cardBorder,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary,
  },
});
