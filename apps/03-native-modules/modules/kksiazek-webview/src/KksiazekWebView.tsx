import { requireNativeView } from "expo";

import type { KksiazekWebViewProps } from "./KksiazekWebView.types";

const NativeKksiazekWebView = requireNativeView<KksiazekWebViewProps>("KksiazekWebView");

export function KksiazekWebView(props: KksiazekWebViewProps) {
  return <NativeKksiazekWebView {...props} />;
}
