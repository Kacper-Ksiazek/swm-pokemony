import { Text, View } from "react-native";

import { emptyStateStyles } from "./empty-state.styles";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={emptyStateStyles.centered}>
      <Text style={emptyStateStyles.helperText}>{message}</Text>
    </View>
  );
}
