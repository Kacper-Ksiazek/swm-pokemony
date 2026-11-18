import { StyleSheet, View } from "react-native";
import { KeyboardToolbar } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import type { EdgeInsets } from "react-native-safe-area-context";

import { TOOLBAR_BG, TOOLBAR_BORDER, TOOLBAR_THEME } from "../keyboard-aware-form-demo.constants";
import { useToolbarVisibility } from "../hooks/use-toolbar-visibility";
import { ToolbarDoneButton } from "./toolbar-done-button";
import { ToolbarNavIcon } from "./toolbar-nav-icon";

type AnimatedKeyboardToolbarProps = {
  insets: EdgeInsets;
};

export function AnimatedKeyboardToolbar({ insets }: AnimatedKeyboardToolbarProps) {
  const { toolbarAnimatedStyle } = useToolbarVisibility();

  return (
    <Animated.View pointerEvents="box-none" style={[styles.toolbarOverlay, toolbarAnimatedStyle]}>
      <KeyboardToolbar
        theme={TOOLBAR_THEME}
        offset={{
          closed: insets.bottom + 48,
          opened: 37,
        }}
      >
        <KeyboardToolbar.Background>
          <View style={styles.toolbarBackground} />
        </KeyboardToolbar.Background>
        <KeyboardToolbar.Prev icon={ToolbarNavIcon} style={styles.navButtonSlot} />
        <KeyboardToolbar.Next icon={ToolbarNavIcon} style={styles.navButtonSlot} />
        <KeyboardToolbar.Content />
        <KeyboardToolbar.Done text="Done" button={ToolbarDoneButton} />
      </KeyboardToolbar>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toolbarOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  toolbarBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: TOOLBAR_BG,
    borderWidth: 1,
    borderColor: TOOLBAR_BORDER,
    borderRadius: 20,
  },
  navButtonSlot: {
    marginRight: 6,
  },
});
