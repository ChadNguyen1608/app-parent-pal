import { Redirect, Stack } from 'expo-router';

import { APP_VARIANT } from '@/variant';

export default function ChildLayout() {
  if (APP_VARIANT !== 'child') return <Redirect href="/" />;
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="con-can-giup-do" options={{ title: 'Con cần giúp đỡ' }} />
    </Stack>
  );
}
