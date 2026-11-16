import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { theme } from "@/components/theme";

type DemoItem = {
  title: string;
  subtitle: string;
  href: Href;
  status: "done" | "todo";
};

type DemoSection = {
  title: string;
  items: DemoItem[];
};

/** Landing list. Routes live in src/app; each entry points at one demo screen. */
export const DEMO_SECTIONS: DemoSection[] = [
  {
    title: "Globals",
    items: [
      {
        title: "Globals",
        subtitle: "Assignments 1–4 · int, bool, string, array",
        href: "/globals",
        status: "done",
      },
    ],
  },
  {
    title: "Functions",
    items: [
      {
        title: "Counter",
        subtitle: "Assignment 5 · increment / decrement HostFunctions",
        href: "/counter",
        status: "done",
      },
      {
        title: "Math functions",
        subtitle: "Assignments 6, 10 · calculate over a number array",
        href: "/math-functions",
        status: "done",
      },
      {
        title: "Divide",
        subtitle: "Assignment 7 · throw on divide by zero",
        href: "/divide",
        status: "done",
      },
    ],
  },
  {
    title: "Callbacks",
    items: [
      {
        title: "Array Map",
        subtitle: "Assignment 11 · nativeMap with JS callback",
        href: "/array-map",
        status: "done",
      },
    ],
  },
  {
    title: "Strings",
    items: [
      {
        title: "Strings",
        subtitle: "Assignment 8 · transformString",
        href: "/strings",
        status: "done",
      },
    ],
  },
  {
    title: "Host objects",
    items: [
      {
        title: "Date",
        subtitle: "Assignment 13 · getDateObject HostObject",
        href: "/date",
        status: "done",
      },
      {
        title: "Infinity",
        subtitle: "Assignment 14 · InfinityObject HostObject",
        href: "/infinity",
        status: "done",
      },
    ],
  },
  {
    title: "Objects & native state",
    items: [
      {
        title: "Sum Object",
        subtitle: "Assignment 9 · sumMeThisObject",
        href: "/sum-object",
        status: "done",
      },
      {
        title: "Native State",
        subtitle: "Assignment 15 · native counter on a passed object",
        href: "/native-state",
        status: "done",
      },
    ],
  },
];

export function LandingScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {DEMO_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <Pressable
                key={item.title}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => router.push(item.href)}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={[styles.statusPill, item.status === "todo" && styles.statusTodo]}>
                  <Text
                    style={[styles.statusText, item.status === "todo" && styles.statusTextTodo]}
                  >
                    {item.status === "done" ? "Done" : "TO_DO"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg + 2,
    padding: 16,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textHeading,
  },
  rowSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  statusPill: {
    backgroundColor: "#0F2A24",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusTodo: {
    backgroundColor: theme.colors.dangerBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.success,
  },
  statusTextTodo: {
    color: theme.colors.danger,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
