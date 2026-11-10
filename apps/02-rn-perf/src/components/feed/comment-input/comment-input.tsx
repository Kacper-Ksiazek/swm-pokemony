import type { Ref } from "react";
import type { TextInputInstance } from "react-native";
import { View } from "react-native";

import type { FeedComment } from "@/data/mock-feed";

import { CommentInputRow } from "./components/comment-input-row";
import { MentionSuggestions } from "./components/mention-suggestions";
import { useCommentInput } from "./hooks/use-comment-input";

type CommentInputProps = {
  ref?: Ref<TextInputInstance>;
  onSubmit: (text: string) => void;
  placeholder: string;
  comments: FeedComment[];
  bottomInset: number;
  replyTo?: { username: string } | null;
};

/**
 * A comment input with a horizontal mention-suggestion bar that appears
 * when the user is typing an @mention.
 */
function CommentInput({
  ref,
  onSubmit,
  placeholder,
  comments,
  bottomInset,
  replyTo,
}: CommentInputProps) {
  const {
    text,
    setText,
    mentionSuggestions,
    showSuggestions,
    showTopBorder,
    handleSelectMention,
    handleSubmit,
  } = useCommentInput({ comments, onSubmit, replyTo });

  return (
    <View>
      {/* Mention suggestions bar — each chip is artificially heavy */}
      {showSuggestions && (
        <MentionSuggestions suggestions={mentionSuggestions} onSelect={handleSelectMention} />
      )}

      {/* Input row */}
      <CommentInputRow
        ref={ref}
        text={text}
        onChangeText={setText}
        onSubmit={handleSubmit}
        placeholder={placeholder}
        bottomInset={bottomInset}
        showTopBorder={showTopBorder}
      />
    </View>
  );
}

export { CommentInput };
