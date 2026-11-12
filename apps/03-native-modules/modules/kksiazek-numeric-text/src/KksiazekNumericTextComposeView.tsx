import type { PrimitiveBaseProps } from "@expo/ui/jetpack-compose";
import { createViewModifierEventListener } from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";

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
    <NativeKksiazekNumericTextComposeView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...rest}
    />
  );
}
