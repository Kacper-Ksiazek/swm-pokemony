import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

import { useWebViewLoadState, WebViewLabFrame } from "../shared";

type ReferenceWebViewPanelProps = {
  url: string;
};

export function ReferenceWebViewPanel({ url }: ReferenceWebViewPanelProps) {
  const { isLoading, loadedUrl, handleLoad } = useWebViewLoadState(url);

  return (
    <WebViewLabFrame
      packageName="react-native-webview"
      badge="Referencja — biblioteka"
      tone="reference"
      isLoading={isLoading}
      loadedUrl={loadedUrl}
    >
      <WebView
        source={{ uri: url }}
        onLoad={(event) => {
          handleLoad(event.nativeEvent.url);
        }}
        style={styles.web}
      />
    </WebViewLabFrame>
  );
}

const styles = StyleSheet.create({
  web: {
    flex: 1,
  },
});
