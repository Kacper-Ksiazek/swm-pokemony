import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { router } from "expo-router";

import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import type { DemoItem } from "../landing-data";

const LIST_EXIT = FadeOut.duration(160);

type ExerciseListItemProps = {
  item: DemoItem;
  index: number;
};

export function enterExerciseRow(index: number) {
  return FadeIn.delay(Math.min(index * 45, 360)).duration(220);
}

export function ExerciseListItem({ item, index }: ExerciseListItemProps) {
  return (
    <Animated.View entering={enterExerciseRow(index)} exiting={LIST_EXIT}>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        onPress={() => router.push(item.href)}
      >
        <View style={styles.rowIcon}>
          <IconSymbol name={item.icon} size={22} color={theme.colors.accent} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
        </View>
        {item.status === "todo" ? (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>TO_DO</Text>
          </View>
        ) : (
          <View style={styles.statusDone}>
            <IconSymbol name="checkmark" size={17} color={theme.colors.success} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.badgeBg,
    borderWidth: 1,
    borderColor: theme.colors.badgeBorder,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: theme.colors.dangerBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.successBg,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.danger,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
