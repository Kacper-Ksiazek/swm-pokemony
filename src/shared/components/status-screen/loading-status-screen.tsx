import { ActivityIndicator, Text, View } from "react-native";

import { defaultStatusAccentColor, statusScreenStyles } from "./status-screen.styles";

type LoadingStatusScreenProps = {
  message?: string;
  accentColor?: string;
};

export function LoadingStatusScreen({
  message = "Loading…",
  accentColor = defaultStatusAccentColor,
}: LoadingStatusScreenProps) {
  return (
    <View style={statusScreenStyles.centered}>
      <ActivityIndicator size="large" color={accentColor} />
      <Text style={statusScreenStyles.helperText}>{message}</Text>
    </View>
  );
}
