import { useRouter } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BookmarkButton } from "@/components/feed/actions/bookmark-button";
import { LikeButton } from "@/components/feed/actions/like-button";
import { ShareButton } from "@/components/feed/actions/share-button";
import { ColorsContext } from "@/context/colors-context";

interface PostDetailEngagementProps {
  postId: string;
  username: string;
  caption: string;
  initialIsLiked: boolean;
  initialLikes: number;
  initialIsBookmarked: boolean;
}

export function PostDetailEngagement({
  postId,
  username,
  caption,
  initialIsLiked,
  initialLikes,
  initialIsBookmarked,
}: PostDetailEngagementProps) {
  const colors = useContext(ColorsContext);
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [shareCount, setShareCount] = useState(0);

  const handleLike = useCallback(() => {
    setIsLiked((current) => {
      const nextIsLiked = !current;
      setLikesCount((count) => count + (nextIsLiked ? 1 : -1));
      return nextIsLiked;
    });
  }, []);

  const handleShareComplete = useCallback(() => {
    setShareCount((count) => count + 1);
  }, []);

  return (
    <>
      <View style={styles.actionsRow}>
        <View style={styles.actionsLeading}>
          <LikeButton isLiked={isLiked} colors={colors} onPress={handleLike} />
          <ShareButton
            postId={postId}
            username={username}
            colors={colors}
            onShareComplete={handleShareComplete}
          />
        </View>
        <BookmarkButton initialIsBookmarked={initialIsBookmarked} colors={colors} />
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity onPress={() => router.push(`/likes/${postId}`)}>
          <Text style={[styles.likesText, { color: colors.text }]}>
            {likesCount.toLocaleString()} likes
          </Text>
        </TouchableOpacity>

        {shareCount > 0 && (
          <Text style={[styles.shareText, { color: colors.icon }]}>
            · {shareCount} {shareCount === 1 ? "share" : "shares"}
          </Text>
        )}
      </View>

      {caption.length > 0 && (
        <View style={styles.captionBlock}>
          <Text style={[styles.captionText, { color: colors.text }]}>
            <Text
              style={styles.captionUsername}
              onPress={() => router.push(`/profile/${username}`)}
            >
              {username}
            </Text>{" "}
            {caption}
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionsLeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  likesText: {
    fontWeight: "600",
    fontSize: 14,
  },
  shareText: {
    fontSize: 14,
  },
  captionBlock: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: "600",
  },
});
