import { NativeTabs } from "expo-router/native-tabs";

export default function RootLayout() {
  return (
    <NativeTabs tintColor="#208AEF">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Task 1</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="1.circle.fill" md="looks_one" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="task-2">
        <NativeTabs.Trigger.Label>Task 2</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="2.circle.fill" md="looks_two" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="task-3">
        <NativeTabs.Trigger.Label>Task 3</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="3.circle.fill" md="looks_3" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="task-4">
        <NativeTabs.Trigger.Label>Task 4</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="4.circle.fill" md="looks_4" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="task-5">
        <NativeTabs.Trigger.Label>Task 5</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="5.circle.fill" md="looks_5" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
