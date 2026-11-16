import { Host, type CommonViewModifierProps } from "@expo/ui/swift-ui";
import { createViewModifierEventListener } from "@expo/ui/swift-ui/modifiers";
import { requireNativeView } from "expo";
import { View } from "react-native";

export interface KksiazekNumericTextSwiftUIViewProps extends CommonViewModifierProps {
  title: string;
  children?: React.ReactNode;
}

const NativeKksiazekNumericTextSwiftUIView = requireNativeView<KksiazekNumericTextSwiftUIViewProps>(
  "KksiazekNumericText",
  "KksiazekNumericTextSwiftUIView",
);

export default function KksiazekNumericTextSwiftUIView({
  modifiers,
  ...rest
}: KksiazekNumericTextSwiftUIViewProps) {
  console.log("🩵 [kksiazek-numeric-text] KksiazekNumericTextSwiftUIView()");

  return (
    <View style={{ width: "100%" }}>
      <Host matchContents={{ vertical: true }}>
        <NativeKksiazekNumericTextSwiftUIView
          modifiers={modifiers}
          {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
          {...rest}
        />
      </Host>
    </View>
  );
}
