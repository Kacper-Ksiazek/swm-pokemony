import { useCallback, useContext, useState } from "react";
import { TouchableOpacity } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ColorsContext } from "@/context/colors-context";

export function BookmarkButton({ initialIsBookmarked }: { initialIsBookmarked: boolean }) {
  const colors = useContext(ColorsContext);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => !prev);
  }, []);

  return (
    <TouchableOpacity onPress={handleBookmark}>
      <IconSymbol
        name={isBookmarked ? "bookmark.fill" : "bookmark"}
        size={24}
        color={colors.text}
      />
    </TouchableOpacity>
  );
}
