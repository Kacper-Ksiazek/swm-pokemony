import { KksiazekWebView } from "kksiazek-webview";
import { StyleSheet } from "react-native";

import { useWebViewLoadState, WebViewLabFrame } from "../shared";

type SolutionWebViewPanelProps = {
  url: string;
};

export function SolutionWebViewPanel({ url }: SolutionWebViewPanelProps) {
  const { isLoading, loadedUrl, handleLoad } = useWebViewLoadState(url);

  return (
    <WebViewLabFrame
      packageName="kksiazek-webview"
      badge="Native WebView"
      tone="solution"
      isLoading={isLoading}
      loadedUrl={loadedUrl}
    >
      <KksiazekWebView
        url={url}
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
