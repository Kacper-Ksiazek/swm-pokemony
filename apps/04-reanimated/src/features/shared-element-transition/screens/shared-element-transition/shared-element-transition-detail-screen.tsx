import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  SharedTransition,
  SharedTransitionBoundary,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useIsFocused, useLocalSearchParams } from "expo-router";

import { DemoScreen } from "@/components/demo-screen";
import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { getPokemonLocation } from "./data";

const transition = SharedTransition.duration(450);

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
          <Animated.Image
            sharedTransitionTag={location.id}
            sharedTransitionStyle={transition}
            source={location.image}
            style={styles.hero}
            resizeMode="cover"
          />

          <Animated.View entering={FadeIn.delay(150).duration(350)} style={styles.body}>
            <View style={styles.regionPill}>
              <Text style={styles.regionText}>{location.region}</Text>
            </View>

            <Text style={styles.title}>{location.name}</Text>
            <Text style={styles.subtitle}>{location.subtitle}</Text>
            <Text style={styles.description}>{location.description}</Text>
          </Animated.View>
        </ScrollView>

        <Pressable
          style={[styles.backButton, { top: insets.top + 8 }]}
          onPress={() => router.back()}
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
  hero: {
    width: "100%",
    height: 320,
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
  regionPill: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  regionText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.pillText,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.textHeading,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.textSecondary,
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
