import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { type GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { displaySource, FeedImage } from "@/components/feed/feed-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ColorsContext } from "@/context/colors-context";
import { PostOptionsMenu } from "./post-options-menu";

export const PostHeader = ({
  postId,
  username,
  avatar,
  isVerified,
  locationName,
  onHidePost,
}: {
  postId: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  locationName: string;
  onHidePost: () => void;
}) => {
  const colors = useContext(ColorsContext);
  const router = useRouter();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | undefined>();

  const openLocation = () => {
    router.push(`/location/${encodeURIComponent(locationName)}`);
  };

  const handleMenuPress = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    setMenuAnchor({ x: pageX, y: pageY });
    setShowOptionsMenu(true);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.userRow}
          onPress={() => router.push(`/profile/${username}`)}
        >
          <View style={styles.avatarClip}>
            <FeedImage source={displaySource(avatar, 32, 32)} style={styles.avatar} />
            <View style={styles.avatarOverlay} />
          </View>

          <View>
            <View style={styles.nameRow}>
              <Text style={{ fontWeight: "600", fontSize: 14, color: colors.text }}>
                {username}
              </Text>
              {isVerified && <IconSymbol name="checkmark.seal.fill" size={14} color="#3d2847" />}
            </View>
            <TouchableOpacity onPress={openLocation}>
              <View style={styles.locationRow}>
                <IconSymbol name="mappin" size={11} color={colors.icon} />
                <Text style={{ fontSize: 11, color: colors.icon }}>{locationName}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleMenuPress}>
          <IconSymbol name="ellipsis" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <PostOptionsMenu
        visible={showOptionsMenu}
        setVisible={setShowOptionsMenu}
        postId={postId}
        username={username}
        onHidePost={onHidePost}
        anchorPosition={menuAnchor}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarClip: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#271c2d",
  },
  avatar: {
    width: 32,
    height: 32,
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
