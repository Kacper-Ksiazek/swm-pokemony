import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "expo-router";
import { SensorType, useAnimatedSensor, type ValueRotation } from "react-native-reanimated";

import { DemoScreen, monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

const POLL_INTERVAL_MS = 100;
const RAD_TO_DEG = 180 / Math.PI;

function formatSigned(value: number, decimals: number): string {
  const threshold = 0.5 * Math.pow(10, -decimals);
  const normalized = Math.abs(value) < threshold ? 0 : value;
  const formatted = normalized.toFixed(decimals);
  return normalized > 0 ? `+${formatted}` : formatted;
}

function AngleCell({ label, radians }: { label: string; radians: number }) {
  const degrees = radians * RAD_TO_DEG;

  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{formatSigned(radians, 3)} rad</Text>
      <Text style={styles.cellHint}>{formatSigned(degrees, 1)}°</Text>
    </View>
  );
}

export function SensorsScreen() {
  const isFocused = useIsFocused();
  const rotation = useAnimatedSensor(SensorType.ROTATION);
  const [value, setValue] = useState<ValueRotation>(() => rotation.sensor.value);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const readSensor = () => {
      setValue(rotation.sensor.value);
    };

    readSensor();
    const intervalId = setInterval(readSensor, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isFocused, rotation.sensor]);

  return (
    <DemoScreen>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>ROTATION</Text>
            <Text style={styles.subtitle}>Euler angles · roll, pitch, yaw</Text>
          </View>

          <View style={styles.badges}>
            <View style={styles.orientationPill}>
              <Text style={styles.orientationText}>{value.interfaceOrientation}°</Text>
            </View>
            <View
              style={[
                styles.statusPill,
                rotation.isAvailable ? styles.availablePill : styles.unavailablePill,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  rotation.isAvailable ? styles.availableText : styles.unavailableText,
                ]}
              >
                {rotation.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <AngleCell label="ROLL" radians={value.roll} />
          <AngleCell label="PITCH" radians={value.pitch} />
          <AngleCell label="YAW" radians={value.yaw} />
        </View>
      </View>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg + 2,
    padding: 14,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: theme.colors.textPrimary,
    fontFamily: monoFont,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orientationPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  orientationText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    fontFamily: monoFont,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  availablePill: {
    backgroundColor: theme.colors.successBg,
    borderColor: theme.colors.success,
  },
  unavailablePill: {
    backgroundColor: theme.colors.dangerBg,
    borderColor: theme.colors.dangerBorder,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    fontFamily: monoFont,
  },
  availableText: {
    color: theme.colors.success,
  },
  unavailableText: {
    color: theme.colors.danger,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cell: {
    minWidth: "30%",
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: theme.colors.textMuted,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    fontFamily: monoFont,
    fontVariant: ["tabular-nums"],
  },
  cellHint: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: monoFont,
    fontVariant: ["tabular-nums"],
  },
});
