import { StyleSheet, Text } from "react-native";

import { DemoCard } from "./demo-card";
import { DemoScreen } from "./demo-screen";
import { theme } from "./theme";

/** Shown for assignments that are not implemented yet (status ⬜ TO_DO). */
export function PlaceholderScreen({
  title,
  assignment,
  description,
}: {
  title: string;
  assignment: string;
  description: string;
}) {
  return (
    <DemoScreen badge={`Assignment ${assignment}`} title={title}>
      <DemoCard eyebrow="NOT IMPLEMENTED" title="TO_DO">
        <Text style={styles.text}>{description}</Text>
      </DemoCard>
    </DemoScreen>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
});
