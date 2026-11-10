import { useRouter } from "expo-router";
import { memo, useContext, useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { displaySource, FeedImage } from "@/components/feed/feed-image";
import { ColorsContext } from "@/context/colors-context";
import type { FeedPost } from "@/data/mock-feed";
import { findRelatedPosts } from "@/utils/related-posts";

interface PostDetailRelatedPostsProps {
  post: FeedPost;
}

export const PostDetailRelatedPosts = memo(function PostDetailRelatedPosts({
  post,
}: PostDetailRelatedPostsProps) {
  const colors = useContext(ColorsContext);
  const router = useRouter();
  const relatedPosts = useMemo(() => findRelatedPosts(post), [post]);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { borderTopColor: `${colors.icon}30` }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>You might also like</Text>
      <FlatList
        horizontal
        data={relatedPosts}
        keyExtractor={(item) => item.post.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/post/${item.post.id}`)}
            style={styles.card}
          >
            <FeedImage
              source={displaySource(
                item.post.images[0]?.thumbnailUri || item.post.images[0]?.uri || "",
                140,
                140,
              )}
              style={styles.thumbnail}
            />
            <Text numberOfLines={1} style={[styles.username, { color: colors.text }]}>
              {item.post.user.username}
            </Text>
            <Text numberOfLines={1} style={[styles.reasons, { color: colors.icon }]}>
              {item.reasons.slice(0, 2).join(" · ")}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    borderTopWidth: 0.5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  card: {
    width: 140,
  },
  thumbnail: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
  username: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  reasons: {
    fontSize: 11,
    marginTop: 2,
  },
});
