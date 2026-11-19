import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { monoFont } from "@/components/demo-screen";
import { IconSymbol } from "@/components/icon-symbol";
import { theme } from "@/components/theme";

import { VICE_COLORS } from "../constants";
import type { GamePhase, RaceStats } from "../sensors.types";

const MENU_BACKGROUND = require("../../../assets/vice-poke-emblem.jpg");

type GameOverlayProps = {
  phase: GamePhase;
  stats: RaceStats;
  onStart: () => void;
  onResume: () => void;
};

export function GameOverlay({ phase, stats, onStart, onResume }: GameOverlayProps) {
  const insets = useSafeAreaInsets();
  const ctaPulse = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.92);

  useEffect(() => {
    ctaPulse.set(
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, [ctaPulse]);

  useEffect(() => {
    if (phase === "playing") {
      overlayOpacity.set(0);
      return;
    }

    contentScale.set(0.92);
    overlayOpacity.set(withTiming(1, { duration: 280, easing: Easing.out(Easing.ease) }));
    contentScale.set(withSpring(1, { damping: 14, stiffness: 180 }));
  }, [contentScale, overlayOpacity, phase]);

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaPulse.get() }],
  }));

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.get(),
    transform: [{ scale: contentScale.get() }],
  }));

  if (phase === "playing") {
    return null;
  }

  return (
    <View style={styles.backdrop}>
      <Image source={MENU_BACKGROUND} style={styles.menuImage} resizeMode="cover" />
      <View style={[styles.scrim, phase !== "ready" && styles.scrimDarker]} pointerEvents="none" />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Wróć"
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8, left: Math.max(12, insets.left + 8) }]}
      >
        <IconSymbol name="chevron.left" size={18} color={VICE_COLORS.cyan} />
        <Text style={styles.backButtonText}>Wróć</Text>
      </Pressable>

      <Animated.View style={[styles.content, contentAnimStyle]}>
        {phase === "ready" && (
          <>
            <Text style={styles.badge}>VICE CITY × KANTO</Text>
            <Text style={styles.title}>VICE POKÉ RACER</Text>
            <Text style={styles.description}>
              Trzymaj telefon poziomo jak kierownicę. Przechylaj w lewo lub w prawo, wyprzedzaj
              rywali na neonowej autostradzie i buduj nitro combo!
            </Text>
            <Animated.View style={[styles.actions, ctaStyle]}>
              <Pressable style={styles.primaryButton} onPress={onStart}>
                <Text style={styles.primaryButtonText}>START WYŚCIGU</Text>
              </Pressable>
            </Animated.View>
          </>
        )}

        {phase === "paused" && (
          <>
            <Text style={styles.badge}>PAUZA // VICE-DEX</Text>
            <Text style={styles.title}>WYŚCIG WSTRZYMANY</Text>
            <Text style={styles.description}>
              Wyprzedzone: {stats.overtaken} · Wynik: {stats.score}
            </Text>
            <Animated.View style={[styles.actions, ctaStyle]}>
              <Pressable style={styles.primaryButton} onPress={onResume}>
                <Text style={styles.primaryButtonText}>WZNÓW JAZDĘ</Text>
              </Pressable>
            </Animated.View>
          </>
        )}

        {phase === "gameover" && (
          <>
            <Text style={[styles.badge, styles.gameoverBadge]}>BUSTED × FAINTED</Text>
            <Text style={styles.title}>WYNIK: {stats.score}</Text>
            <Text style={styles.description}>
              Wyprzedzone: {stats.overtaken} · Rekord: {stats.bestScore}
            </Text>
            <Animated.View style={[styles.actions, ctaStyle]}>
              <Pressable style={styles.primaryButton} onPress={onStart}>
                <Text style={styles.primaryButtonText}>ZAGRAJ PONOWNIE</Text>
              </Pressable>
            </Animated.View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  menuImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: VICE_COLORS.cardBg,
    borderWidth: 1,
    borderColor: VICE_COLORS.cardBorderCyan,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: VICE_COLORS.textPrimary,
  },
  scrim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(9, 5, 20, 0.52)",
  },
  scrimDarker: {
    backgroundColor: "rgba(9, 5, 20, 0.72)",
  },
  content: {
    width: "100%",
    maxWidth: 420,
    gap: 10,
    alignItems: "center",
  },
  badge: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    color: VICE_COLORS.cyan,
    fontFamily: monoFont,
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  gameoverBadge: {
    color: VICE_COLORS.pink,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: VICE_COLORS.gold,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "600",
    color: VICE_COLORS.textPrimary,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: VICE_COLORS.pink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    borderColor: VICE_COLORS.cyan,
    shadowColor: VICE_COLORS.pink,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    color: VICE_COLORS.textPrimary,
    fontFamily: monoFont,
  },
});
