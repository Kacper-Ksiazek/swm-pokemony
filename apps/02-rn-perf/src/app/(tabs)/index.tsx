import { startTransition, useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { FeedHeader } from "@/components/feed/feed-header";
import { FeedList } from "@/components/feed/feed-list";

import { ColorsContext } from "@/context/colors-context";
import { type FeedListItem, MOCK_FEED, toSlimFeed } from "@/data/mock-feed";

const HomeScreen = () => {
  const colors = useContext(ColorsContext);

  const [feedData, setFeedData] = useState<FeedListItem[]>([]);

  useEffect(() => {
    startTransition(() => {
      setFeedData(toSlimFeed(MOCK_FEED));
    });
  }, []);

  const handleLike = useCallback((id: string) => {
    setFeedData((prev) =>
      prev.map((item) => {
        if (item.type !== "post" || item.id !== id) return item;
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1,
        };
      }),
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <FeedHeader />
      <FeedList data={feedData} onLike={handleLike} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
