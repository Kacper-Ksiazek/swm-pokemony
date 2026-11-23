import { useEffect } from "react";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { CHESS_PIECE_IMAGES } from "@/features/chess/assets/chess-assets";

import type { ChessPiece as ChessPieceModel } from "../../../../utils/chess-engine";

type ChessPieceProps = {
  piece: ChessPieceModel;
  row: number;
  col: number;
  squareSize: number;
  isSelected: boolean;
};

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
  mass: 0.7,
};

export function ChessPiece({ piece, row, col, squareSize, isSelected }: ChessPieceProps) {
  const translateX = useSharedValue(col * squareSize);
  const translateY = useSharedValue(row * squareSize);
  const scale = useSharedValue(isSelected ? 1.14 : 1);

  useEffect(() => {
    translateX.set(withSpring(col * squareSize, SPRING_CONFIG));
    translateY.set(withSpring(row * squareSize, SPRING_CONFIG));
  }, [col, row, squareSize, translateX, translateY]);

  useEffect(() => {
    scale.set(withSpring(isSelected ? 1.14 : 1, SPRING_CONFIG));
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
      { scale: scale.get() },
    ],
    zIndex: isSelected ? 20 : 10,
  }));

  const pieceSize = squareSize * 1.3;
  const horizontalOffset = (squareSize - pieceSize) / 2;
  const verticalOffset = squareSize - pieceSize;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: verticalOffset,
          left: horizontalOffset,
          width: pieceSize,
          height: pieceSize,
        },
        animatedStyle,
      ]}
    >
      <Image
        source={CHESS_PIECE_IMAGES[piece.color][piece.type]}
        style={styles.image}
        contentFit="contain"
        contentPosition="bottom"
        transition={0}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
