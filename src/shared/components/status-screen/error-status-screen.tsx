import { Text, View } from "react-native";

import { Button } from "@/shared/components/button";

import { statusScreenStyles } from "./status-screen.styles";

type ErrorStatusScreenProps = {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  detail?: string;
  compact?: boolean;
};

export function ErrorStatusScreen({
  title,
  message,
  onRetry,
  retryLabel = "Try again",
  detail,
  compact = false,
}: ErrorStatusScreenProps) {
  return (
    <View style={[statusScreenStyles.centered, compact && statusScreenStyles.compact]}>
      <Text style={statusScreenStyles.errorTitle}>{title}</Text>
      <Text style={statusScreenStyles.helperText}>{message}</Text>
      {detail != null && detail.length > 0 ? (
        <Text style={statusScreenStyles.devDetail}>{detail}</Text>
      ) : null}
      <Button label={retryLabel} onPress={onRetry} />
    </View>
  );
}
