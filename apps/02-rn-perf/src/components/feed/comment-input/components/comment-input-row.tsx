import type { Ref } from "react";
import { useContext } from "react";
import {
  Image,
  Text,
  TextInput,
  type TextInputInstance,
  TouchableOpacity,
  View,
} from "react-native";

import { ColorsContext } from "@/context/colors-context";

type CommentInputRowProps = {
  ref?: Ref<TextInputInstance>;
  text: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder: string;
  bottomInset: number;
  showTopBorder: boolean;
};

function CommentInputRow({
  ref,
  text,
  onChangeText,
  onSubmit,
  placeholder,
  bottomInset,
  showTopBorder,
}: CommentInputRowProps) {
  const colors = useContext(ColorsContext);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: showTopBorder ? 0.5 : 0,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
        paddingBottom: bottomInset + 10,
      }}
    >
      <Image
        source={{ uri: "https://i.pravatar.cc/150?img=68" }}
        style={{ width: 32, height: 32, borderRadius: 16 }}
      />

      <TextInput
        ref={ref}
        style={{
          flex: 1,
          marginHorizontal: 12,
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: colors.icon + "15",
          borderRadius: 20,
          color: colors.text,
          fontSize: 14,
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        value={text}
        onChangeText={onChangeText}
        multiline
        maxLength={500}
      />

      <TouchableOpacity onPress={onSubmit} disabled={!text.trim()}>
        <Text
          style={{
            color: text.trim() ? "#271c2d" : colors.icon,
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          Post
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export { CommentInputRow };
