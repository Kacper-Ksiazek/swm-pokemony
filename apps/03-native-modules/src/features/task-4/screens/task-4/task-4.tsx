import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReferenceWebViewPanel } from "./reference";
import { SolutionWebViewPanel } from "./solution";
import {
  DEFAULT_WEB_URL,
  normalizeWebUrl,
  WebViewAddressBar,
  type WebViewLabSource,
  WebViewLabSourceTabs,
} from "./shared";

export function Task4Screen() {
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<WebViewLabSource>("reference");
  const [draftUrl, setDraftUrl] = useState(DEFAULT_WEB_URL);
  const [url, setUrl] = useState(DEFAULT_WEB_URL);
  const [error, setError] = useState<string | null>(null);

  const openUrl = (raw: string) => {
    const next = normalizeWebUrl(raw);
    if (!next) {
      setError("Podaj adres http lub https.");
      return;
    }

    setError(null);
    setDraftUrl(next);
    setUrl(next);
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: insets.bottom },
      ]}
    >
      <WebViewLabSourceTabs value={source} onChange={setSource} />
      <WebViewAddressBar
        value={draftUrl}
        error={error}
        onChange={setDraftUrl}
        onSubmit={() => openUrl(draftUrl)}
        onPreset={openUrl}
      />

      <View style={styles.panelSlot}>
        {source === "reference" ? (
          <ReferenceWebViewPanel url={url} />
        ) : (
          <SolutionWebViewPanel url={url} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    gap: 12,
  },
  panelSlot: {
    flex: 1,
    minHeight: 0,
  },
});
