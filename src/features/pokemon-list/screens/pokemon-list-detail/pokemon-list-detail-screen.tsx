import { capitalize } from "es-toolkit/string";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { HeaderHeightContext } from "expo-router/react-navigation";
import { SymbolView } from "expo-symbols";
import { useContext } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { pokemonSpriteUrl } from "@/data/pokemon-api";
import { EmptyState } from "@/shared/components/empty-state";
import { PokemonDetails } from "@/shared/components/pokemon-details";
import { PokemonIdBadge } from "@/shared/components/pokemon-id-badge";
import { PressableScale } from "@/shared/components/pressable-scale";
import { usePokemonDetail } from "@/shared/hooks";
import { COLORS, SPACING, TYPE_SIZE } from "@/shared/styles/colors";

import { useFavoritePokemon } from "../../hooks";

const HERO_HEIGHT = 240;

/** When header height is unavailable (e.g. web), approximate stack header + status bar. */
const STATUS_BAR_FALLBACK = Platform.OS === "ios" ? 59 : 0;
const HEADER_BAR_FALLBACK = Platform.OS === "ios" ? 54 : 56;

export function PokemonListDetailScreen() {
  const { id: idParam, name: nameParam } = useLocalSearchParams<{ id: string; name?: string }>();
  const pokemonId = parsePokemonId(idParam);
  const nameFromRoute = firstParam(nameParam);
  const { detail, detailLoading, detailError, retryDetail } = usePokemonDetail(pokemonId);
  const { favoriteId, toggleFavorite } = useFavoritePokemon();
  const displayName = capitalize(detail?.name ?? nameFromRoute ?? "Pokémon");
  const favoriteRecordName = detail?.name ?? nameFromRoute;
  const isFavorite = pokemonId !== null && favoriteId === pokemonId;
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const headerHeightFromContext = useContext(HeaderHeightContext);
  const headerHeight =
    headerHeightFromContext ??
    (insets.top > 0 ? insets.top : STATUS_BAR_FALLBACK) + HEADER_BAR_FALLBACK;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.set(event.contentOffset.y);
    },
  });

  const imageStyle = useAnimatedStyle(() => {
    const y = scrollY.get();

    return {
      transform: [{ scale: interpolate(y, [-80, 0, 180], [1.06, 1, 0.72], Extrapolation.CLAMP) }],
    };
  });

  if (pokemonId === null) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <EmptyState
          icon={{ ios: "questionmark.circle", android: "help", web: "help" }}
          title="Not found"
          message={
            nameFromRoute !== null
              ? `${displayName} could not be found.`
              : "This Pokémon could not be found."
          }
        />
      </SafeAreaView>
    );
  }

  const favoriteLabel = isFavorite
    ? `Remove ${displayName} from favorites`
    : `Mark ${displayName} as favorite`;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {favoriteRecordName !== null ? (
        <Stack.Screen
          options={{
            headerRight: () => (
              <PressableScale
                pressedScale={0.9}
                accessibilityRole="button"
                accessibilityLabel={favoriteLabel}
                hitSlop={8}
                onPress={() => toggleFavorite({ id: pokemonId, name: favoriteRecordName })}
                style={styles.headerButton}
              >
                <SymbolView
                  name={{
                    ios: isFavorite ? "heart.fill" : "heart",
                    android: isFavorite ? "favorite" : "favorite_border",
                    web: isFavorite ? "favorite" : "favorite_border",
                  }}
                  size={22}
                  tintColor={isFavorite ? COLORS.PRIMARY : COLORS.TEXT_MUTED}
                />
              </PressableScale>
            ),
          }}
        />
      ) : null}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + SPACING.sm }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.imageBox}>
            <Animated.View style={[styles.image, imageStyle]}>
              <Image
                source={{ uri: pokemonSpriteUrl(pokemonId) }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
            </Animated.View>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <PokemonIdBadge id={pokemonId} />
        </View>

        <View style={styles.details}>
          <PokemonDetails
            detail={detail}
            loading={detailLoading}
            error={detailError}
            onRetry={retryDetail}
          />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function firstParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
    return value[0];
  }

  return null;
}

function parsePokemonId(value: string | string[] | undefined): number | null {
  const raw = firstParam(value);

  if (raw === null) {
    return null;
  }

  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "stretch",
    paddingBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  hero: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  imageBox: {
    width: "100%",
    height: HERO_HEIGHT,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  details: {
    paddingHorizontal: SPACING.xl,
  },
  name: {
    fontSize: TYPE_SIZE.title,
    fontWeight: "700",
    color: COLORS.TEXT,
    paddingHorizontal: SPACING.xl,
    textAlign: "center",
  },
  headerButton: {
    padding: SPACING.sm,
  },
});
