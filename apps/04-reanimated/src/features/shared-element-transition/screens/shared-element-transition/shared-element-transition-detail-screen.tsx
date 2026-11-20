import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, SharedTransitionBoundary } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useIsFocused, useLocalSearchParams } from "expo-router";

import { DemoScreen } from "@/components/demo-screen";
import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { LocationSeeAlsoSection } from "./components/location-see-also-section";
import {
  LocationSharedImage,
  LocationSharedRegionPill,
  LocationSharedSubtitle,
  LocationSharedTitle,
} from "./components/shared-location-elements";
import { getPokemonLocation } from "./data";

export function SharedElementTransitionDetailScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const location = id ? getPokemonLocation(id) : undefined;

  if (!location) {
    return (
      <SharedTransitionBoundary isActive={isFocused}>
        <DemoScreen>
          <Text style={styles.missing}>Unknown location.</Text>
        </DemoScreen>
      </SharedTransitionBoundary>
    );
  }

  return (
    <SharedTransitionBoundary isActive={isFocused}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="never">
          <LocationSharedImage location={location} variant="hero" />

          <View style={styles.body}>
            <LocationSharedRegionPill location={location} />
            <LocationSharedTitle location={location} variant="detail" />
            <LocationSharedSubtitle location={location} variant="detail" />

            <Animated.Text entering={FadeIn.delay(150).duration(350)} style={styles.description}>
              {location.description}
            </Animated.Text>

            <LocationSeeAlsoSection currentId={location.id} />
          </View>
        </ScrollView>

        <Pressable
          style={[styles.backButton, { top: insets.top + 8 }]}
          onPress={() => router.replace("/shared-element-transition")}
        >
          <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </SharedTransitionBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: 24,
  },
  backButton: {
    position: "absolute",
    top: 56,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 16,
    gap: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textPrimary,
  },
  missing: {
    color: theme.colors.textSecondary,
  },
});
