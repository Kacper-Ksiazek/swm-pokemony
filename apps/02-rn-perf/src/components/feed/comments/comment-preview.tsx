import { useRouter } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { displaySource, FeedImage } from "@/components/feed/feed-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ColorsContext } from "@/context/colors-context";
import type { FeedComment } from "@/data/mock-feed";
import { formatRelativeTime } from "@/utils/feed-utils";

export const CommentPreview = ({ comment, postId }: { comment: FeedComment; postId: string }) => {
  const colors = useContext(ColorsContext);
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);

  useEffect(() => {
    setLikeCount(comment.likes);
  }, [comment.likes]);

  const formattedTime = useMemo(() => formatRelativeTime(comment.timestamp), [comment.timestamp]);

  const handleReply = () => {
    router.push(`/post/comments/${postId}`);
  };

  const openProfile = () => {
    router.push(`/profile/${comment.username}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openProfile}>
        <FeedImage
          source={displaySource(comment.avatar, 28, 28)}
          style={[styles.avatar, styles.avatarClip]}
        />
      </TouchableOpacity>
      <View style={styles.body}>
        <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>
          <Text style={styles.username} onPress={openProfile}>
            {comment.username}
          </Text>{" "}
          {comment.text}
        </Text>
        <View style={styles.meta}>
          <Text style={{ fontSize: 11, color: colors.icon }}>{formattedTime}</Text>
          <Text style={{ fontSize: 11, color: colors.icon }}>{likeCount} likes</Text>
          <TouchableOpacity onPress={handleReply}>
            <Text style={{ fontSize: 11, color: colors.icon, fontWeight: "600" }}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          setIsLiked(!isLiked);
          setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        }}
        style={styles.heartButton}
      >
        <IconSymbol
          name={isLiked ? "heart.fill" : "heart"}
          size={12}
          color={isLiked ? "#FF6B6B" : colors.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "flex-start",
    gap: 10,
  },
  avatarClip: {
    borderRadius: 14,
    overflow: "hidden",
  },
  avatar: {
    width: 28,
    height: 28,
  },
  body: {
    flex: 1,
  },
  username: {
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  heartButton: {
    paddingTop: 4,
  },
});
