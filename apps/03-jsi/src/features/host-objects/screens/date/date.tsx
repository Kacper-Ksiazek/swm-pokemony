import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { DemoCard, DemoSmallButton } from "@/components/demo-card";
import { DemoScreen, monoFont } from "@/components/demo-screen";
import { ErrorBox } from "@/components/result-box";
import { PrimaryButton } from "@/components/primary-button";
import { theme } from "@/components/theme";

type DateSnapshot = {
  now: string;
  day: number;
  month: number;
  year: number;
  keys: string[];
};

function readDateSnapshot(hostObj: JsiDateHostObject): DateSnapshot {
  return {
    now: hostObj.now,
    day: hostObj.day,
    month: hostObj.month,
    year: hostObj.year,
    keys: Object.keys(hostObj),
  };
}

/** #13 getDateObject: a C++ HostObject with live getters and setters. */
export function DateScreen() {
  const dateRef = useRef<JsiDateHostObject | null>(null);
  if (dateRef.current === null) {
    dateRef.current = globalThis.getDateObject();
  }

  const [snapshot, setSnapshot] = useState<DateSnapshot>(() => readDateSnapshot(dateRef.current!));
  const [dayInput, setDayInput] = useState(() => String(snapshot.day));
  const [monthInput, setMonthInput] = useState(() => String(snapshot.month));
  const [yearInput, setYearInput] = useState(() => String(snapshot.year));
  const [error, setError] = useState<string | null>(null);

  const syncFromHostObject = useCallback((hostObj: JsiDateHostObject) => {
    const next = readDateSnapshot(hostObj);
    setSnapshot(next);
    setDayInput(String(next.day));
    setMonthInput(String(next.month));
    setYearInput(String(next.year));
    setError(null);
  }, []);

  const handleNewInstance = useCallback(() => {
    const fresh = globalThis.getDateObject();
    dateRef.current = fresh;
    syncFromHostObject(fresh);
  }, [syncFromHostObject]);

  const handleReadNow = useCallback(() => {
    if (!dateRef.current) return;
    setSnapshot(readDateSnapshot(dateRef.current));
    setError(null);
  }, []);

  const handleApply = useCallback(() => {
    const hostObj = dateRef.current;
    if (!hostObj) return;

    const nextDay = Number(dayInput.trim());
    const nextMonth = Number(monthInput.trim());
    const nextYear = Number(yearInput.trim());
    if (!Number.isFinite(nextDay) || !Number.isFinite(nextMonth) || !Number.isFinite(nextYear)) {
      setError("Day, month, and year must be valid numbers.");
      return;
    }

    try {
      hostObj.day = nextDay;
      hostObj.month = nextMonth;
      hostObj.year = nextYear;
      syncFromHostObject(hostObj);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update Date HostObject.");
    }
  }, [dayInput, monthInput, yearInput, syncFromHostObject]);

  return (
    <DemoScreen
      badge="jsi::HostObject"
      title="Date"
      action={{ label: "New Instance", onPress: handleNewInstance }}
    >
      <DemoCard
        eyebrow="NATIVE PROPERTIES"
        title="getDateObject()"
        headerRight={<DemoSmallButton label="Read .now" onPress={handleReadNow} />}
      >
        <View style={styles.nowBox}>
          <Text style={styles.label}>date.now (live C++ ctime)</Text>
          <Text style={styles.nowValue}>{snapshot.now}</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label="day" value={snapshot.day} />
          <Stat label="month" value={snapshot.month} />
          <Stat label="year" value={snapshot.year} />
        </View>

        <Text style={styles.keys}>Object.keys(date): {JSON.stringify(snapshot.keys)}</Text>
      </DemoCard>

      <DemoCard eyebrow="MUTATE HOSTOBJECT" title="date.day / month / year = ...">
        <View style={styles.inputsRow}>
          <DateField label="Day" value={dayInput} onChangeText={setDayInput} placeholder="5" />
          <DateField
            label="Month"
            value={monthInput}
            onChangeText={setMonthInput}
            placeholder="12"
          />
          <DateField
            label="Year"
            value={yearInput}
            onChangeText={setYearInput}
            placeholder="2025"
          />
        </View>

        <PrimaryButton label="Write to C++ HostObject" onPress={handleApply} />

        {error ? <ErrorBox message={error} /> : null}
      </DemoCard>
    </DemoScreen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function DateField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  nowBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  nowValue: {
    fontFamily: monoFont,
    fontSize: 14,
    color: theme.colors.code,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.accent,
    fontVariant: ["tabular-nums"],
  },
  keys: {
    fontFamily: monoFont,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  inputsRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldGroup: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});
