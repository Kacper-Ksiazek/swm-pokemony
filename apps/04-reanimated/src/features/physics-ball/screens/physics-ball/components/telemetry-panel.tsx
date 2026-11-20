import { Pressable, StyleSheet, Text, View } from "react-native";

import { monoFont } from "@/components/demo-screen";
import { theme } from "@/components/theme";

import type { BallStatus, BallTelemetry } from "../hooks/use-physics-ball";
import { useFpsMeter } from "../hooks/use-fps-meter";
import { FpsChart } from "./fps-chart";

type TelemetryPanelProps = {
  telemetry: BallTelemetry;
  onReset: () => void;
};

const STATUS_LABEL: Record<BallStatus, string> = {
  idle: "IDLE",
  grabbed: "GRABBED",
  coasting: "COASTING",
};

function formatSigned(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export function TelemetryPanel({ telemetry, onReset }: TelemetryPanelProps) {
  const isMoving = telemetry.status !== "idle";
  const { samples, currentFps, maxSamples } = useFpsMeter();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.eyebrow}>Telemetry</Text>
          <View
            style={[
              styles.statusPill,
              telemetry.status === "grabbed" && styles.statusPillGrabbed,
              telemetry.status === "coasting" && styles.statusPillCoasting,
            ]}
          >
            <Text style={[styles.statusText, isMoving && styles.statusTextActive]}>
              {STATUS_LABEL[telemetry.status]}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onReset}
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
          hitSlop={8}
        >
          <Text style={styles.resetLabel}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>POS (X, Y)</Text>
          <Text style={styles.cellValue}>
            {formatSigned(telemetry.x)}, {formatSigned(telemetry.y)} px
          </Text>
          <Text style={styles.cellHint}>
            bounds ±{telemetry.boundsX} × ±{telemetry.boundsY}
          </Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.cellLabel}>VEL (VX, VY)</Text>
          <Text style={styles.cellValue}>
            {formatSigned(telemetry.vx)}, {formatSigned(telemetry.vy)}
          </Text>
          <Text style={styles.cellHint}>px / s</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.cellLabel}>SPEED |V|</Text>
          <Text style={styles.cellValue}>{telemetry.speed} px/s</Text>
          <Text style={styles.cellHint}>√(vx² + vy²)</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.cellLabel}>BOUNCES</Text>
          <Text style={styles.cellValue}>{telemetry.bounces}</Text>
          <Text style={styles.cellHint}>last wall: {telemetry.lastWall}</Text>
        </View>
      </View>

      <FpsChart samples={samples} currentFps={currentFps} maxSamples={maxSamples} />
    </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statusPillGrabbed: {
    backgroundColor: theme.colors.pillBg,
    borderColor: theme.colors.badgeBorder,
  },
  statusPillCoasting: {
    backgroundColor: theme.colors.successBg,
    borderColor: theme.colors.success,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: theme.colors.textSecondary,
    fontFamily: monoFont,
  },
  statusTextActive: {
    color: theme.colors.textPrimary,
  },
  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  resetButtonPressed: {
    opacity: 0.7,
  },
  resetLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cell: {
    width: "48.5%",
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
    fontSize: 14,
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
