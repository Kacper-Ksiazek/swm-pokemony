import { RNHostView } from "@expo/ui/swift-ui";
import type { ReactElement } from "react";

type SheetBodyProps = {
  children: ReactElement;
};

// The SwiftUI sheet is its own view controller. RNHostView is what dispatches touches there.
export function SheetBody({ children }: SheetBodyProps) {
  return <RNHostView>{children}</RNHostView>;
}
