import { Pressable, StyleSheet, Text, View } from "react-native";

export type OrientationLabSource = "reference" | "solution";

type OrientationSourceTabsProps = {
  value: OrientationLabSource;
  onChange: (value: OrientationLabSource) => void;
};

const TABS: { id: OrientationLabSource; label: string; hint: string }[] = [
  { id: "reference", label: "Reference", hint: "Referencja" },
  { id: "solution", label: "Solution", hint: "Twój moduł" },
];

export function OrientationSourceTabs({ value, onChange }: OrientationSourceTabsProps) {
  return (
    <View style={styles.root}>
      <View style={styles.track} accessibilityRole="tablist">
        {TABS.map((tab) => {
          const selected = tab.id === value;

          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => onChange(tab.id)}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
                {tab.label}
              </Text>
              <Text style={[styles.tabHint, selected && styles.tabHintSelected]}>{tab.hint}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: 10,
  },
  track: {
    flexDirection: "row",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 2,
  },
  tabSelected: {
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666666",
  },
  tabLabelSelected: {
    color: "#111111",
  },
  tabHint: {
    fontSize: 11,
    fontWeight: "500",
    color: "#999999",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tabHintSelected: {
    color: "#0d74ce",
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: "#888888",
    textAlign: "center",
    paddingHorizontal: 4,
  },
});
