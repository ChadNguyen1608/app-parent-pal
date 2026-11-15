import { Redirect, Stack } from 'expo-router';

import { LabScreen } from '@/lab/LabScreen';
import { LAB_ENABLED } from '@/variant';

export default function Lab() {
  if (!LAB_ENABLED) return <Redirect href="/" />;
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Đo nhắc giờ' }} />
      <LabScreen />
    </>
  );
}
