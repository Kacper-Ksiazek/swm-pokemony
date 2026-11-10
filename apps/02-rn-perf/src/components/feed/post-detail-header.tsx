import { useRouter } from "expo-router";
import { useContext, useMemo, useState } from "react";
import {
  type GestureResponderEvent,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ImageCarousel } from "@/components/feed/content/image-carousel";
import { PostOptionsMenu } from "@/components/feed/header/post-options-menu";
import { PostDetailEngagement } from "@/components/feed/post-detail-engagement";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ColorsContext } from "@/context/colors-context";
import type { FeedPost } from "@/data/mock-feed";
import { formatRelativeTime } from "@/utils/feed-utils";

interface PostDetailHeaderProps {
  post: FeedPost;
  commentsCount: number;
  hasNewComments: boolean;
}

export const PostDetailHeader = ({
  post,
  commentsCount,
  hasNewComments,
}: PostDetailHeaderProps) => {
  const colors = useContext(ColorsContext);
  const router = useRouter();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | undefined>();

  const formattedTime = useMemo(() => {
    return formatRelativeTime(post.timestamp);
  }, [post.timestamp]);

  return (
    <View>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => router.push(`/profile/${post.user.username}`)}
        >
          <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
          <View>
            <View style={styles.usernameRow}>
              <Text style={[styles.usernameText, { color: colors.text }]}>
                {post.user.username}
              </Text>
              {post.user.isVerified && (
                <IconSymbol name="checkmark.seal.fill" size={14} color="#3d2847" />
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/location/${encodeURIComponent(post.location.name)}`)}
            >
              <Text style={[styles.locationText, { color: colors.icon }]}>
                {post.location.name}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={(e: GestureResponderEvent) => {
            const { pageX, pageY } = e.nativeEvent;
            setMenuAnchor({ x: pageX, y: pageY });
            setShowOptionsMenu(true);
          }}
        >
          <Text style={[styles.optionsText, { color: colors.text }]}>•••</Text>
        </TouchableOpacity>
      </View>

      <PostOptionsMenu
        visible={showOptionsMenu}
        setVisible={setShowOptionsMenu}
        postId={post.id}
        username={post.user.username}
        anchorPosition={menuAnchor}
      />

      <ImageCarousel images={post.images} />

      <PostDetailEngagement
        postId={post.id}
        username={post.user.username}
        caption={post.caption}
        initialIsLiked={post.isLiked}
        initialLikes={post.likes}
        initialIsBookmarked={post.isBookmarked}
      />

      <Text style={[styles.timestamp, { color: colors.icon }]}>{formattedTime}</Text>

      <View style={[styles.commentsSection, { borderTopColor: `${colors.icon}30` }]}>
        <View style={styles.commentsRow}>
          <Text style={[styles.commentsCountText, { color: colors.text }]}>
            {commentsCount === 1 ? "1 Comment" : `${commentsCount} Comments`}
          </Text>
          {hasNewComments && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#271c2d",
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  usernameText: {
    fontWeight: "600",
    fontSize: 14,
  },
  locationText: {
    fontSize: 11,
  },
  optionsText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timestamp: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    fontSize: 11,
    textTransform: "uppercase",
  },
  commentsSection: {
    borderTopWidth: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  commentsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentsCountText: {
    fontSize: 14,
    fontWeight: "600",
  },
  newBadge: {
    backgroundColor: "#3d2847",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
});
