import { useCallback, useContext } from "react";
import { Share, TouchableOpacity } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ColorsContext } from "@/context/colors-context";

export function ShareButton({
  postId,
  username,
  onShareComplete,
}: {
  postId: string;
  username: string;
  onShareComplete: () => void;
}) {
  const colors = useContext(ColorsContext);

  const handleShare = useCallback(async () => {
    try {
      const result = await Share.share({
        message: `Check out this post by @${username}: https://example.com/post/${postId}`,
        url: `https://example.com/post/${postId}`,
      });
      if (result.action === Share.sharedAction) {
        onShareComplete();
      }
    } catch {
      // User cancelled
    }
  }, [postId, username, onShareComplete]);

  return (
    <TouchableOpacity style={{ padding: 2 }} onPress={handleShare}>
      <IconSymbol name="paperplane" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}
