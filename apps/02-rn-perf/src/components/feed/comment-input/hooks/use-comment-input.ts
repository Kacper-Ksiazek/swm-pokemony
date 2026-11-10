import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FeedComment } from "@/data/mock-feed";
import { buildMentionSuggestions } from "@/utils/mention-utils";

import { insertMention } from "../utils/insert-mention";

type UseCommentInputParams = {
  comments: FeedComment[];
  onSubmit: (text: string) => void;
  replyTo?: { username: string } | null;
};

function useCommentInput({ comments, onSubmit, replyTo }: UseCommentInputParams) {
  const [text, setText] = useState("");
  const hadReplyTo = useRef(false);

  useEffect(() => {
    if (replyTo) {
      setText(`@${replyTo.username} `);
      hadReplyTo.current = true;
    } else if (hadReplyTo.current) {
      setText("");
      hadReplyTo.current = false;
    }
  }, [replyTo]);

  const isTypingMention = text.match(/@(\w*)$/) !== null;

  const mentionSuggestions = useMemo(
    () => buildMentionSuggestions(comments, text),
    [comments, text],
  );

  const showSuggestions = isTypingMention && mentionSuggestions.length > 0;
  const showTopBorder = !replyTo;

  const handleSelectMention = useCallback((username: string) => {
    setText((current) => insertMention(current, username));
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(text);
    setText("");
  }, [text, onSubmit]);

  return {
    text,
    setText,
    mentionSuggestions,
    showSuggestions,
    showTopBorder,
    handleSelectMention,
    handleSubmit,
  };
}

export { useCommentInput };
