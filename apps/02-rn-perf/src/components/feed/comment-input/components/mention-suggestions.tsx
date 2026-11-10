import { useContext } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ColorsContext } from "@/context/colors-context";

type MentionSuggestionsProps = {
  suggestions: { username: string; relevance: number }[];
  onSelect: (username: string) => void;
};

function MentionSuggestions({ suggestions, onSelect }: MentionSuggestionsProps) {
  const colors = useContext(ColorsContext);
  // Run expensive work synchronously for each chip during this
  // component's render — this blocks the JS thread.
  const chips = suggestions.slice(0, 8).map((item) => {
    const displayName = item.username;
    return { ...item, displayName };
  });

  return (
    <View
      style={{
        borderTopWidth: 0.5,
        borderTopColor: colors.icon + "30",
        backgroundColor: colors.background,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {chips.map((item) => (
          <TouchableOpacity
            key={item.username}
            onPress={() => onSelect(item.username)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: colors.icon + "15",
              borderRadius: 16,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              @{item.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export { MentionSuggestions };
