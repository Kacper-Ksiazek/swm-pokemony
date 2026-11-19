import { View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { styles } from "../road-track.styles";
import type { TrafficVehicleSpriteProps } from "../road-track.types";

export function TrafficVehicleSprite({
  index,
  roadWidth,
  roadHeight,
  traffic,
}: TrafficVehicleSpriteProps) {
  const containerStyle = useAnimatedStyle(() => {
    const car = traffic.get()[index];
    if (!car || !car.active) {
      return { opacity: 0 };
    }

    const carW = roadWidth * car.widthNorm;
    const carH = roadHeight * car.heightNorm;

    return {
      opacity: 1,
      width: carW,
      height: carH,
      borderRadius: car.kind === "moto" ? carW * 0.45 : car.kind === "bus" ? 8 : carW * 0.24,
      backgroundColor: car.color,
      transform: [
        { translateX: car.x * roadWidth - carW / 2 },
        { translateY: car.y * roadHeight - carH / 2 },
        { rotate: `${car.leanDeg}deg` },
      ],
    };
  });

  const carWindowStyle = useAnimatedStyle(() => {
    const car = traffic.get()[index];
    return { opacity: car?.kind === "moto" ? 0 : 1 };
  });

  const motoDetailStyle = useAnimatedStyle(() => {
    const car = traffic.get()[index];
    return { opacity: car?.kind === "moto" ? 1 : 0 };
  });

  const busRoofStyle = useAnimatedStyle(() => {
    const car = traffic.get()[index];
    return { opacity: car?.kind === "bus" ? 1 : 0 };
  });

  return (
    <Animated.View style={[styles.carBody, containerStyle]}>
      <Animated.View style={[styles.rivalWindshield, carWindowStyle]} />
      <Animated.View style={[styles.busRoofVent, busRoofStyle]} />
      <Animated.View style={[styles.motoHelmet, motoDetailStyle]} />
      <Animated.View style={[styles.rivalRearWindow, carWindowStyle]} />
      <View style={styles.rivalTaillights}>
        <View style={styles.taillight} />
        <View style={styles.taillight} />
      </View>
    </Animated.View>
  );
}
