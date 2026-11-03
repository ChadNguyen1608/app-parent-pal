import { Stack } from 'expo-router';

import '@/lab/geofence-task';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
