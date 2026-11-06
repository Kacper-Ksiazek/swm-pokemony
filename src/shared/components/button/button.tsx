import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { forwardRef } from "react";
import { type PressableProps, StyleSheet, Text, type View } from "react-native";

import { COLORS, RADIUS, SPACING, TYPE_SIZE } from "@/shared/styles/colors";

import { PressableScale } from "../pressable-scale";

type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant?: "primary" | "secondary";
  icon?: SymbolViewProps["name"];
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  { label, variant = "primary", icon, accessibilityLabel, disabled = false, ...rest },
  ref,
) {
  const isPrimary = variant === "primary";

  return (
    <PressableScale
      ref={ref}
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={[styles.base, isPrimary ? styles.primary : styles.secondary]}
    >
      {icon != null ? (
        <SymbolView name={icon} size={20} tintColor={isPrimary ? COLORS.BACKGROUND : COLORS.TEXT} />
      ) : null}
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  base: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.control,
  },
  primary: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondary: {
    backgroundColor: COLORS.SURFACE,
  },
  label: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
  },
  primaryLabel: {
    color: COLORS.BACKGROUND,
  },
  secondaryLabel: {
    color: COLORS.TEXT,
  },
});
