import { Host, type PrimitiveBaseProps } from "@expo/ui/jetpack-compose";
import { createViewModifierEventListener } from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";
import { View } from "react-native";

export interface KksiazekNumericTextComposeViewProps extends PrimitiveBaseProps {
  title: string;
  children?: React.ReactNode;
}

const NativeKksiazekNumericTextComposeView = requireNativeView<KksiazekNumericTextComposeViewProps>(
  "KksiazekNumericText",
  "KksiazekNumericTextComposeView",
);

export default function KksiazekNumericTextComposeView({
  modifiers,
  ...rest
}: KksiazekNumericTextComposeViewProps) {
  return (
    <View style={{ width: "100%", alignSelf: "stretch" }}>
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <NativeKksiazekNumericTextComposeView
          modifiers={modifiers}
          {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
          {...rest}
        />
      </Host>
    </View>
  );
}
