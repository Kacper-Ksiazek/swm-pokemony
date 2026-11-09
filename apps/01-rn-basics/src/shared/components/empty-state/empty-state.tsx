import { type Href, Link } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Text, View } from "react-native";

import { COLORS } from "@/shared/styles/colors";

import { emptyStateStyles } from "./empty-state.styles";

type EmptyStateProps = {
  message: string;
  title?: string;
  icon?: SymbolViewProps["name"];
  href?: Href;
  actionLabel?: string;
};

export function EmptyState({ message, title, icon, href, actionLabel }: EmptyStateProps) {
  return (
    <View style={emptyStateStyles.centered}>
      {icon != null ? <SymbolView name={icon} size={36} tintColor={COLORS.TEXT_MUTED} /> : null}
      {title != null ? <Text style={emptyStateStyles.title}>{title}</Text> : null}
      <Text style={emptyStateStyles.helperText}>{message}</Text>
      {href != null && actionLabel != null ? (
        <Link href={href} style={emptyStateStyles.link}>
          {actionLabel}
        </Link>
      ) : null}
    </View>
  );
}
