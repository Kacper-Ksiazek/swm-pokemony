import { useRouter } from "expo-router";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { ColorsContext } from "@/context/colors-context";

export const CommentsLink = ({
  totalComments,
  postId,
}: {
  totalComments: number;
  postId: string;
}) => {
  const colors = useContext(ColorsContext);
  const router = useRouter();

  if (totalComments === 0) return null;

  const openComments = () => {
    router.push(`/post/comments/${postId}`);
  };

  return (
    <TouchableOpacity onPress={openComments}>
      <Text style={[styles.text, { color: colors.icon }]}>
        {totalComments === 1 ? "View 1 comment" : `View all ${totalComments} comments`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    paddingHorizontal: 12,
    paddingTop: 6,
    fontSize: 14,
  },
});
