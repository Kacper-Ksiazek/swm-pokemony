import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type FaceScanDebug = {
  scans: number;
  faces: number;
  placed: boolean;
  error: string | null;
};

type FaceScanStatusProps = {
  status: FaceScanDebug;
  scannerReady: boolean;
};

export function FaceScanStatus({ status, scannerReady }: FaceScanStatusProps) {
  const insets = useSafeAreaInsets();
  const label = scanLabel(status, scannerReady);

  return (
    <View pointerEvents="none" style={[styles.badge, { top: insets.top + 12 }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function scanLabel(status: FaceScanDebug, scannerReady: boolean): string {
  if (!scannerReady) {
    return "Detector not started";
  }

  if (status.error != null) {
    return status.error;
  }

  if (status.scans === 0) {
    return "Looking for a face…";
  }

  if (status.faces === 0) {
    return `Looking… no face (${status.scans})`;
  }

  if (status.placed) {
    return `Face found (${status.faces})`;
  }

  return `Face seen, sticker hidden (${status.faces})`;
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    left: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  label: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
