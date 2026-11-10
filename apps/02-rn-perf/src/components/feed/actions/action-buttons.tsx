import { useRouter } from "expo-router";
import { useContext, useDeferredValue, useMemo } from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LikesCount } from "@/components/feed/content/likes-count";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ColorsContext } from "@/context/colors-context";
import { computeEngagementRate } from "@/utils/feed-utils";

export const ActionButtons = ({
  postId,
  username,
  likes,
  isLiked,
  onLike,
}: {
  postId: string;
  username: string;
  likes: number;
  isLiked: boolean;
  onLike: (id: string) => void;
}) => {
  const colors = useContext(ColorsContext);
  const router = useRouter();

  const likesText = `${likes.toLocaleString()} likes`;

  const deferredLikes = useDeferredValue(likes);
  const engagementScore = useMemo(
    () => computeEngagementRate(deferredLikes, 0, username),
    [deferredLikes, username],
  );
  const isEngagementStale = deferredLikes !== likes;

  const handleLike = () => {
    onLike(postId);
  };

  const handleComment = () => {
    router.push(`/post/comments/${postId}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post by @${username}: https://example.com/post/${postId}`,
        url: `https://example.com/post/${postId}`,
      });
    } catch {
      // User cancelled
    }
  };

  const openLikes = () => {
    router.push(`/likes/${postId}`);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftButtons}>
          <TouchableOpacity onPress={handleLike} style={styles.iconButton}>
            <IconSymbol
              name={isLiked ? "heart.fill" : "heart"}
              size={26}
              color={isLiked ? "#FF6B6B" : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleComment}>
            <IconSymbol name="bubble.right" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <IconSymbol name="paperplane" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <LikesCount likesText={likesText} onPress={openLikes} />
      <Text
        style={[styles.engagement, { color: colors.icon, opacity: isEngagementStale ? 0.45 : 1 }]}
      >
        Engagement score {engagementScore.toFixed(1)}
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  leftButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    padding: 2,
  },
  engagement: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    fontSize: 11,
  },
});
