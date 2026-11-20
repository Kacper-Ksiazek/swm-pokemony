import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardController } from "react-native-keyboard-controller";

import { DemoScreen } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import { KeyboardAwareFormDemo } from "./components/keyboard-aware-form-demo";
import { KeyboardHandlerDemo } from "./components/keyboard-handler-demo";
import { KeyboardStickyViewDemo } from "./components/keyboard-sticky-view-demo";

type DemoTab = "handler" | "sticky" | "form";

const DEMO_TABS: { id: DemoTab; label: string }[] = [
  { id: "handler", label: "Handler" },
  { id: "sticky", label: "StickyView" },
  { id: "form", label: "AwareForm" },
];

export function KeyboardHandlerScreen() {
  const [activeTab, setActiveTab] = useState<DemoTab>("handler");

  const handleSelectTab = (tab: DemoTab) => {
    if (tab === activeTab) {
      return;
    }

    KeyboardController.dismiss();
    setActiveTab(tab);
  };

  return (
    <DemoScreen scroll={false} fullWidth>
      <View style={styles.tabBar}>
        {DEMO_TABS.map((tab) => {
          const isSelected = tab.id === activeTab;

          return (
            <Pressable
              key={tab.id}
              onPress={() => handleSelectTab(tab.id)}
              style={[styles.tabChip, isSelected && styles.tabChipSelected]}
            >
              <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.demoStage}>
        {activeTab === "handler" && <KeyboardHandlerDemo />}
        {activeTab === "sticky" && <KeyboardStickyViewDemo />}
        {activeTab === "form" && <KeyboardAwareFormDemo />}
      </View>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
  },
  tabChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.chipBorder,
    borderRadius: theme.radius.md,
    paddingVertical: 9,
  },
  tabChipSelected: {
    backgroundColor: theme.colors.chipSelected,
    borderColor: theme.colors.accent,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  tabLabelSelected: {
    color: theme.colors.accent,
  },
  demoStage: {
    flex: 1,
  },
});
