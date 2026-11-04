import { Pressable, Text, View } from "react-native";

import { statusScreenStyles } from "./status-screen.styles";

type ErrorStatusScreenProps = {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
};

export function ErrorStatusScreen({
  title,
  message,
  onRetry,
  retryLabel = "Try again",
}: ErrorStatusScreenProps) {
  return (
    <View style={statusScreenStyles.centered}>
      <Text style={statusScreenStyles.errorTitle}>{title}</Text>
      <Text style={statusScreenStyles.helperText}>{message}</Text>
      <Pressable style={statusScreenStyles.retryButton} onPress={onRetry}>
        <Text style={statusScreenStyles.retryLabel}>{retryLabel}</Text>
      </Pressable>
    </View>
  );
}
