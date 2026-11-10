import { Activity, useCallback, useMemo } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { FeedListFooter } from "@/components/feed/feed-list-footer";
import { FeedListRow } from "@/components/feed/feed-list-row";
import type { FeedListItem } from "@/data/mock-feed";
import { useDeferredMountActivityProps } from "@/hooks/use-deferred-mount-activity-props";

export const FeedList = ({
  data,
  onLike,
}: {
  data: FeedListItem[];
  onLike: (id: string) => void;
}) => {
  const contentHeight = useSharedValue(0);
  const layoutHeight = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  const progress = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler((event) => {
    const offset = event.contentOffset.y;
    const max = Math.max(1, contentHeight.get() - layoutHeight.get());
    progress.set(Math.min(1, Math.max(0, offset / max)));
  });

  const fillStyle = useAnimatedStyle(() => ({
    width: trackWidth.get() * progress.get(),
  }));

  const handleContentSizeChange = (_w: number, h: number) => {
    contentHeight.set(h);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    layoutHeight.set(event.nativeEvent.layout.height);
  };

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    trackWidth.set(event.nativeEvent.layout.width);
  };

  const footerActivityProps = useDeferredMountActivityProps();

  const listFooter = useMemo(() => {
    if (footerActivityProps === null) return undefined;

    return (
      <Activity {...footerActivityProps}>
        <FeedListFooter data={data} />
      </Activity>
    );
  }, [data, footerActivityProps]);

  const renderItem = useCallback(
    ({ item }: { item: FeedListItem }) => <FeedListRow item={item} onLike={onLike} />,
    [onLike],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.progressTrack} onLayout={handleTrackLayout}>
        <Animated.View style={[styles.progressFill, fillStyle]} />
      </View>

      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListFooterComponent={listFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        windowSize={21}
        maxToRenderPerBatch={10}
        initialNumToRender={5}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF3B30",
  },
});
