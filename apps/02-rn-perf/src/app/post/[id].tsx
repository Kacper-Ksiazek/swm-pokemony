import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  type TextInputInstance,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommentInput } from "@/components/feed/comment-input";
import { CommentItem } from "@/components/feed/comments/comment-item";
import { PostDetailHeader } from "@/components/feed/post-detail-header";
import { PostDetailRelatedPosts } from "@/components/feed/post-detail-related-posts";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { type FeedComment, type FeedPost, findPostForDetails } from "@/data/mock-feed";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { buildMentionSuggestions } from "@/utils/mention-utils";
import { detectSpam } from "@/utils/spam-detection";

interface ReplyInfo {
  commentId: string;
  username: string;
}

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInputInstance>(null);
  const prevCommentsLengthRef = useRef(0);
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [replyInfo, setReplyInfo] = useState<ReplyInfo | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const foundPost = findPostForDetails(id);

    if (foundPost) {
      setPost(foundPost);
      setComments(foundPost.comments);
    }
  }, [id]);

  const hasNewComments = comments.length > prevCommentsLengthRef.current;
  prevCommentsLengthRef.current = comments.length;

  const handleReply = useCallback((commentId: string, username: string) => {
    setReplyInfo({ commentId, username });
    inputRef.current?.focus();
  }, []);

  const handleAddComment = useCallback(
    (draft: string) => {
      if (!draft.trim() || !post) return;

      const commentText = replyInfo ? draft.replace(`@${replyInfo.username} `, "") : draft;

      // Run spam detection — blocks the JS thread
      const { isSpam, maxSimilarity } = detectSpam(commentText, comments);
      if (isSpam) {
        console.warn(`[Spam] Comment blocked (similarity: ${maxSimilarity.toFixed(2)})`);
        return;
      }

      // Build mention suggestions for the comment context
      const mentionSuggestions = buildMentionSuggestions(comments, commentText);

      const newCommentObj: FeedComment = {
        id: `new-comment-${Date.now()}`,
        username: "you",
        avatar: "https://i.pravatar.cc/150?img=68",
        text: commentText.trim(),
        likes: 0,
        timestamp: "Just now",
        replyingTo: replyInfo?.username,
        mentions: mentionSuggestions.slice(0, 5).map((s, i) => ({
          username: s.username,
          position: { start: i, end: i + s.username.length },
          userId: s.username,
        })),
        replies: [],
      };

      if (replyInfo) {
        // Add as reply to existing comment
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === replyInfo.commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newCommentObj],
              };
            }
            return comment;
          }),
        );
      } else {
        setComments((prev) => [newCommentObj, ...prev]);
      }

      setReplyInfo(null);
    },
    [post, replyInfo, comments],
  );

  const cancelReply = useCallback(() => {
    setReplyInfo(null);
  }, []);

  if (!post) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.cardBackground }]}>
        <Text style={{ color: colors.text }}>Post not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.cardBackground }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Post</Text>
      </View>

      {/* Post Content and Comments List */}
      <FlatList
        data={comments}
        ListHeaderComponent={
          <PostDetailHeader
            post={post}
            commentsCount={comments.length}
            hasNewComments={hasNewComments}
          />
        }
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            onReply={handleReply}
            onProfilePress={(username: string) => {
              router.push(`/profile/${username}`);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              No comments yet. Be the first to comment!
            </Text>
          </View>
        }
        ListFooterComponent={<PostDetailRelatedPosts post={post} />}
      />

      {/* Reply indicator */}
      {replyInfo && (
        <View
          style={[
            styles.replyBar,
            {
              backgroundColor: `${colors.icon}15`,
              borderTopColor: `${colors.icon}30`,
            },
          ]}
        >
          <Text style={[styles.replyText, { color: colors.icon }]}>
            Replying to{" "}
            <Text style={[styles.replyMention, { color: colors.text }]}>@{replyInfo.username}</Text>
          </Text>

          <TouchableOpacity onPress={cancelReply}>
            <IconSymbol name="xmark" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>
      )}

      {/* Comment Input */}
      <CommentInput
        ref={inputRef}
        onSubmit={handleAddComment}
        placeholder={replyInfo ? `Reply to @${replyInfo.username}...` : "Add a comment..."}
        comments={comments}
        bottomInset={insets.bottom}
        replyTo={replyInfo}
      />
    </KeyboardAvoidingView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,
  },
  replyText: {
    fontSize: 13,
  },
  replyMention: {
    fontWeight: "600",
  },
});
