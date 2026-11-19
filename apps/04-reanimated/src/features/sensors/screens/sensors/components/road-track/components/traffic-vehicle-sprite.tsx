import { useState } from "react";
import { Image, type ImageSourcePropType } from "react-native";
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle } from "react-native-reanimated";

import type { VehicleKind } from "../../../sensors.types";
import { styles } from "../road-track.styles";
import type { TrafficVehicleSpriteProps } from "../road-track.types";

const VEHICLE_SPRITES: Record<VehicleKind, ImageSourcePropType> = {
  car: require("../../../../../assets/traffic-car.png"),
  moto: require("../../../../../assets/traffic-moto.png"),
  bus: require("../../../../../assets/traffic-bus.png"),
  police: require("../../../../../assets/traffic-police.png"),
  supercar: require("../../../../../assets/traffic-supercar.png"),
  truck: require("../../../../../assets/traffic-truck.png"),
  taxi: require("../../../../../assets/traffic-taxi.png"),
};

export function TrafficVehicleSprite({
  index,
  roadWidth,
  roadHeight,
  traffic,
}: TrafficVehicleSpriteProps) {
  const [kind, setKind] = useState<VehicleKind>("car");

  useAnimatedReaction(
    () => traffic.get()[index]?.kind ?? "car",
    (next, prev) => {
      if (next !== prev) {
        runOnJS(setKind)(next);
      }
    },
  );

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
      transform: [
        { translateX: car.x * roadWidth - carW / 2 },
        { translateY: car.y * roadHeight - carH / 2 },
        { rotate: `${car.leanDeg}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.spriteContainer, containerStyle]}>
      <Image
        source={VEHICLE_SPRITES[kind]}
        style={[styles.trafficLayer, styles.vehicleImage]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
