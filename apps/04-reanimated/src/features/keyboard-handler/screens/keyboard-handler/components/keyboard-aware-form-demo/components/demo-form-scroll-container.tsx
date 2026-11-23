import type { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type DemoFormScrollContainerProps = {
  keyboardAware: boolean;
  contentPaddingBottom: number;
  children: ReactNode;
};

const KEYBOARD_AWARE_BOTTOM_OFFSET = 68;
const KEYBOARD_AWARE_EXTRA_SPACE = 12;

/** Form scroll area — KeyboardAwareScrollView or plain ScrollView for comparison. */
export function DemoFormScrollContainer({
  keyboardAware,
  contentPaddingBottom,
  children,
}: DemoFormScrollContainerProps) {
  const contentContainerStyle = [styles.scrollContent, { paddingBottom: contentPaddingBottom }];

  const sharedScrollProps = {
    keyboardShouldPersistTaps: "handled" as const,
    showsVerticalScrollIndicator: false,
    contentContainerStyle,
    style: styles.scroll,
  };

  if (keyboardAware) {
    return (
      <KeyboardAwareScrollView
        {...sharedScrollProps}
        bottomOffset={KEYBOARD_AWARE_BOTTOM_OFFSET}
        extraKeyboardSpace={KEYBOARD_AWARE_EXTRA_SPACE}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  }

  return <ScrollView {...sharedScrollProps}>{children}</ScrollView>;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
});
