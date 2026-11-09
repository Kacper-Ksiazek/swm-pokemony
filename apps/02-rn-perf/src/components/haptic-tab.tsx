import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import type { ComponentProps } from "react";
import type { GestureResponderEvent } from "react-native";

type TabBarButtonProps = ComponentProps<typeof PlatformPressable>;

export function HapticTab(props: TabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev: GestureResponderEvent) => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
