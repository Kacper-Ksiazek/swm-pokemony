import { StyleSheet, View } from "react-native";
import { useIsFocused } from "expo-router";

import { DemoScreen } from "@/components/demo-screen";
import { Planet } from "./components/planet";
import { SolarSystemLegend } from "./components/solar-system-legend";
import {
  PLANETS,
  SUN,
  bodyDisplaySize,
  bodySpinRate,
  orbitRadiusPx,
  orbitVelocity,
  solarSystemLayoutSize,
} from "./solar-system-bodies";

export function Stars2dScreen() {
  const isFocused = useIsFocused();

  return (
    <DemoScreen>
      <View style={styles.section}>
        <View style={styles.card}>
          <Planet
            id={SUN.id}
            size={SUN.displaySize}
            color={SUN.color}
            velocity={0}
            angularVelocity={bodySpinRate(SUN.spinPeriodDays)}
            radius={0}
            isActive={isFocused}
          />

          {PLANETS.map((body) => {
            const radius = orbitRadiusPx(body.orbitalAu);

            return (
              <Planet
                key={body.id}
                id={body.id}
                size={bodyDisplaySize(body.diameterRelativeToEarth)}
                color={body.color}
                velocity={orbitVelocity(radius)}
                angularVelocity={bodySpinRate(body.spinPeriodDays)}
                radius={radius}
                includeOverlay={body.includeOverlay}
                isActive={isFocused}
              />
            );
          })}
        </View>
        <SolarSystemLegend />
      </View>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    flex: 1,
  },
  card: {
    width: "100%",
    minWidth: solarSystemLayoutSize,
    minHeight: solarSystemLayoutSize,
    flex: 1,
    alignSelf: "center",
    backgroundColor: "#232323",
  },
});
