import { NativeTabs } from "expo-router/native-tabs";

export default function RootLayout() {
  return (
    <NativeTabs tintColor="#208AEF">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Orientation</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="arrow.triangle.2.circlepath" md="screen_rotation" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="task-2">
        <NativeTabs.Trigger.Label>Numeric</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="textformat.123" md="numbers" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="task-3">
        <NativeTabs.Trigger.Label>Theme</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="paintbrush.fill" md="palette" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="task-4">
        <NativeTabs.Trigger.Label>WebView</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="globe" md="language" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="task-5">
        <NativeTabs.Trigger.Label>Fonts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="textformat" md="format_size" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
