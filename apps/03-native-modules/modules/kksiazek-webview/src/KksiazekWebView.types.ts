import type { ViewProps } from "react-native";

export type KksiazekWebViewLoadEvent = {
  url: string;
};

export type KksiazekWebViewProps = ViewProps & {
  url?: string;
  onLoad?: (event: { nativeEvent: KksiazekWebViewLoadEvent }) => void;
};
