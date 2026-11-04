import { Stack } from 'expo-router';

import { PalProvider } from '@/pal/store';
import '@/lab/geofence-task';

export default function RootLayout() {
  return (
    <PalProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PalProvider>
  );
}
