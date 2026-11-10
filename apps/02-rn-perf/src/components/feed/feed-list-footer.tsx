import { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ColorsContext } from "@/context/colors-context";
import type { FeedListItem } from "@/data/mock-feed";
import { computeEngagementRate } from "@/utils/feed-utils";

const SAMPLE_POSTS = 40;

export const FeedListFooter = ({ data }: { data: FeedListItem[] }) => {
  const colors = useContext(ColorsContext);

  const summary = useMemo(() => {
    let postCount = 0;
    let totalEngagement = 0;

    for (const item of data) {
      if (item.type !== "post") continue;
      if (postCount >= SAMPLE_POSTS) break;

      totalEngagement += computeEngagementRate(item.likes, item.comments.length, item.caption);
      postCount += 1;
    }

    const average = postCount > 0 ? totalEngagement / postCount : 0;
    return { postCount, average };
  }, [data]);

  if (summary.postCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Feed engagement</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Avg. score {summary.average.toFixed(1)} across {summary.postCount} posts (sampled)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
  },
});
