# Declare tabs with NativeTabs.Trigger

The root navigator is `NativeTabs` imported from `expo-router/native-tabs`. Each tab is an explicit `NativeTabs.Trigger` whose `name` matches a route segment (`index`, `screen-b`, `screen-c`). Triggers are not created from the file tree. Do not import `expo-router/unstable-native-tabs`, and do not use the JavaScript `Tabs` layout. Each trigger sets a `Label` and an `Icon` with both an SF Symbol (`sf`) and a Material name (`md`).

## Good

```tsx
import { NativeTabs } from "expo-router/native-tabs";

export default function RootLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Screen A</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="1.circle.fill" md="looks_one" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="screen-b">
        <NativeTabs.Trigger.Label>Screen B</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="2.circle.fill" md="looks_two" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="screen-c">
        <NativeTabs.Trigger.Label>Screen C</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="3.circle.fill" md="looks_3" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

## Bad

```tsx
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function RootLayout() {
  return <Tabs />;
}
```
