import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { theme } from "./theme";

export function DemoCard({
  title,
  eyebrow,
  headerRight,
  style,
  children,
}: {
  title?: string;
  eyebrow?: string;
  headerRight?: React.ReactNode;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.card, style]}>
      {title || eyebrow || headerRight ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </View>
          {headerRight}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function DemoSmallButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.smallButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.xl,
    padding: 18,
    gap: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    gap: 4,
    flexShrink: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: theme.colors.textMuted,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.textHeading,
  },
  smallButton: {
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.chipBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallButtonLabel: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
