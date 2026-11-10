import { useContext } from "react";
import { TouchableOpacity } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ColorsContext } from "@/context/colors-context";

export function LikeButton({ isLiked, onPress }: { isLiked: boolean; onPress: () => void }) {
  const colors = useContext(ColorsContext);
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 2 }}>
      <IconSymbol
        name={isLiked ? "heart.fill" : "heart"}
        size={26}
        color={isLiked ? "#FF6B6B" : colors.text}
      />
    </TouchableOpacity>
  );
}
